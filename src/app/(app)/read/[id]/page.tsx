'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockBooks } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Function to clean and split text into pages
const processAndPaginateContent = (text: string, charsPerPage: number): string[] => {
  if (!text) return [];

  // 1. Clean the text: Remove Project Gutenberg headers/footers
  let cleanedText = text;
  
  // Find start of content
  const startMarkers = [
    '*** START OF THE PROJECT GUTENBERG EBOOK',
    '*** START OF THIS PROJECT GUTENBERG EBOOK',
    'THE SMALL PRINT! FOR PUBLIC DOMAIN ETEXTS',
  ];
  let startIndex = -1;
  for (const marker of startMarkers) {
    const foundIndex = cleanedText.indexOf(marker);
    if (foundIndex !== -1) {
      startIndex = cleanedText.indexOf('***', foundIndex + marker.length);
      if (startIndex !== -1) {
        startIndex += 3; // Move past the '***'
        break;
      }
    }
  }
  if (startIndex !== -1) {
    cleanedText = cleanedText.substring(startIndex);
  }

  // Find end of content
  const endMarkers = [
    '*** END OF THE PROJECT GUTENBERG EBOOK',
    '*** END OF THIS PROJECT GUTENBERG EBOOK',
    'End of the Project Gutenberg EBook',
  ];
  let endIndex = -1;
  for (const marker of endMarkers) {
    endIndex = cleanedText.indexOf(marker);
    if (endIndex !== -1) break;
  }
  if (endIndex !== -1) {
    cleanedText = cleanedText.substring(0, endIndex);
  }

  cleanedText = cleanedText.trim();

  // 2. Paginate the cleaned content
  const pages = [];
  let currentPosition = 0;
  while (currentPosition < cleanedText.length) {
    let endPosition = currentPosition + charsPerPage;
    
    if (endPosition >= cleanedText.length) {
      endPosition = cleanedText.length;
    } else {
      // Find a good breaking point (paragraph, then sentence)
      let breakPoint = cleanedText.lastIndexOf('\n\n', endPosition);
      if (breakPoint <= currentPosition) {
        breakPoint = cleanedText.lastIndexOf('\n', endPosition);
      }
      if (breakPoint <= currentPosition) {
        breakPoint = cleanedText.lastIndexOf('. ', endPosition);
      }
      if (breakPoint > currentPosition) {
        endPosition = breakPoint + 1; // Include the breaking character
      }
    }

    pages.push(cleanedText.substring(currentPosition, endPosition).trim());
    currentPosition = endPosition;
  }
  return pages.filter(page => page.length > 0);
};


export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const id = params.id as string;
  const book = mockBooks.find((b) => b.id === id);

  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const charsPerPage = 1800; // Increased for a better reading experience

  const readingProgressRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !id) return null;
    return doc(firestore, 'users', user.uid, 'readingProgress', id);
  }, [firestore, user?.uid, id]);

  const { data: readingProgress, isLoading: isLoadingProgress } = useDoc(readingProgressRef);

  useEffect(() => {
    if (!isLoadingProgress && readingProgress && pages.length > 0) {
        // Restore current page based on percentage to handle pagination changes
        const pageFromProgress = Math.floor(((readingProgress.percentage ?? 0) / 100) * (pages.length - 1));
        const validPage = Math.max(0, Math.min(pageFromProgress, pages.length - 1));
        if (currentPage !== validPage) {
            setCurrentPage(validPage);
        }
    }
  }, [readingProgress, isLoadingProgress, pages, currentPage]);
  

  const fetchBookContent = useCallback(async (bookId: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const bookUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
        let response = await fetch(`${proxyUrl}${encodeURIComponent(bookUrl)}`);
        
        if (!response.ok) {
            const fallbackUrl = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
            response = await fetch(`${proxyUrl}${encodeURIComponent(fallbackUrl)}`);
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch book content for ID ${bookId}. Status: ${response.status}`);
        }

        const text = await response.text();
        const paginated = processAndPaginateContent(text, charsPerPage);
        setPages(paginated);

        if (!isLoadingProgress && readingProgress) {
            const pageFromProgress = Math.floor(((readingProgress.percentage ?? 0) / 100) * (paginated.length - 1));
            const validPage = Math.max(0, Math.min(pageFromProgress, paginated.length - 1));
            setCurrentPage(validPage);
        } else if (paginated.length > 0) {
            setCurrentPage(0);
        }


    } catch (e: any) {
        console.error("Failed to fetch book content:", e);
        setError("Could not load the book content. Please try again later.");
    } finally {
        setIsLoading(false);
    }
  }, [charsPerPage, isLoadingProgress, readingProgress]);

  useEffect(() => {
    if (id) {
      fetchBookContent(id);
    }
  }, [id, fetchBookContent]);

  const updateReadingProgress = useCallback(() => {
    if (!readingProgressRef || pages.length === 0 || !user || isLoading) return;
    
    const percentage = Math.round(((currentPage + 1) / pages.length) * 100);
    const progressData = {
      userId: user.uid,
      ebookId: id,
      currentPage: currentPage, // 0-based for internal state
      totalPages: pages.length,
      percentage: percentage,
      lastReadAt: new Date().toISOString(),
    };
    setDocumentNonBlocking(readingProgressRef, progressData, { merge: true });
  }, [readingProgressRef, currentPage, pages.length, id, user, isLoading]);
  
  useEffect(() => {
    // Debounce the update to avoid excessive writes
    const handler = setTimeout(() => {
        if (pages.length > 0 && !isLoading) {
            updateReadingProgress();
        }
    }, 1000); // Update after 1 second of inactivity

    return () => {
        clearTimeout(handler);
    };
  }, [currentPage, pages.length, isLoading, updateReadingProgress]);

  if (!book) {
    return notFound();
  }

  const totalPages = pages.length;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  const pageIsLoading = isLoading || (isLoadingProgress && !readingProgress);

  return (
    <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b bg-background sticky top-[56px] md:top-[60px] z-10">
            <div className='flex-1'>
                 <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Library
                </Button>
            </div>
            <div className="text-center flex-1">
                <h1 className="text-lg font-bold font-headline truncate">{book.title}</h1>
                <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
            <div className="flex-1 flex justify-end">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/library">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close Reader</span>
                    </Link>
                </Button>
            </div>
        </header>

        <div className="flex-grow overflow-auto p-4 md:p-8">
            <Card className='max-w-4xl mx-auto'>
                 <CardContent className="p-6 md:p-8 text-lg leading-relaxed whitespace-pre-line font-serif min-h-[60vh] flex items-center justify-center">
                   {pageIsLoading ? (
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   ) : error ? (
                       <div className="text-center text-destructive">
                           <p className="font-semibold">Error</p>
                           <p>{error}</p>
                       </div>
                   ) : pages.length > 0 ? (
                       pages[currentPage]
                   ) : (
                       <p>This book appears to be empty or could not be loaded.</p>
                   )}
                </CardContent>
            </Card>
        </div>
        
        <footer className="p-4 border-t bg-background sticky bottom-0 z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0 || pageIsLoading}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                 <div className='flex-grow text-center flex items-center gap-4 justify-center'>
                    {totalPages > 0 && (
                        <>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <Progress value={progress} className="w-32 h-2" />
                        </>
                    )}
                </div>
                <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1 || pageIsLoading}
                >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </footer>
    </div>
  );
}
