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

// Function to split text into pages
const paginateContent = (text: string, charsPerPage: number): string[] => {
  if (!text) return [];
  const pages = [];
  let start = 0;
  while (start < text.length) {
    let end = start + charsPerPage;
    if (end < text.length) {
      // Try to find a natural break (end of paragraph or sentence)
      let breakPoint = text.lastIndexOf('\n\n', end);
      if (breakPoint <= start) {
        breakPoint = text.lastIndexOf('\n', end);
      }
      if (breakPoint <= start) {
        breakPoint = text.lastIndexOf('. ', end);
      }
      if (breakPoint > start) {
        end = breakPoint + 1;
      }
    }
    pages.push(text.substring(start, end));
    start = end;
  }
  return pages;
};

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const book = mockBooks.find((b) => b.id === id);

  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const charsPerPage = 1500; // Adjust as needed for comfortable reading

  const fetchBookContent = useCallback(async (bookId: string) => {
    setIsLoading(true);
    setError(null);
    try {
        // Use a CORS proxy to bypass browser restrictions
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const bookUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
        const response = await fetch(`${proxyUrl}${encodeURIComponent(bookUrl)}`);
        
        if (!response.ok) {
            // Fallback for different URL structure
            const fallbackUrl = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
            const fallbackResponse = await fetch(`${proxyUrl}${encodeURIComponent(fallbackUrl)}`);
            if (!fallbackResponse.ok) {
                throw new Error(`Failed to fetch book content for ID ${bookId}. Status: ${fallbackResponse.status}`);
            }
            const text = await fallbackResponse.text();
            setPages(paginateContent(text, charsPerPage));
        } else {
             const text = await response.text();
             setPages(paginateContent(text, charsPerPage));
        }
    } catch (e: any) {
        console.error("Failed to fetch book content:", e);
        setError("Could not load the book content. Please try again later.");
    } finally {
        setIsLoading(false);
    }
  }, [charsPerPage]);

  useEffect(() => {
    if (id) {
      fetchBookContent(id);
    }
  }, [id, fetchBookContent]);
  

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

  return (
    <div className="flex flex-col h-full">
        {/* Header */}
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

        {/* Content */}
        <div className="flex-grow overflow-auto p-4 md:p-8">
            <Card className='max-w-4xl mx-auto'>
                 <CardContent className="p-6 md:p-8 text-lg leading-relaxed whitespace-pre-line font-serif min-h-[60vh] flex items-center justify-center">
                   {isLoading ? (
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   ) : error ? (
                       <div className="text-center text-destructive">
                           <p className="font-semibold">Error</p>
                           <p>{error}</p>
                       </div>
                   ) : pages.length > 0 ? (
                       pages[currentPage]
                   ) : (
                       <p>This book appears to be empty.</p>
                   )}
                </CardContent>
            </Card>
        </div>
        
        {/* Footer */}
        <footer className="p-4 border-t bg-background sticky bottom-0 z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0 || isLoading}
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
                    disabled={currentPage === totalPages - 1 || isLoading}
                >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </footer>
    </div>
  );
}
