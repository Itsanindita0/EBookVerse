'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockBooks } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// For placeholder content
const LOREM_IPSUM_PAGES = Array(50)
  .fill(
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
  )
  .map(
    (text, i) => `Page ${i + 1}\n\n${text}`
  );

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const book = mockBooks.find((b) => b.id === id);
  const [currentPage, setCurrentPage] = useState(0);

  if (!book) {
    return notFound();
  }

  const totalPages = LOREM_IPSUM_PAGES.length;

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

  const progress = ((currentPage + 1) / totalPages) * 100;

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
                <CardContent className="p-6 md:p-8 text-lg leading-relaxed whitespace-pre-line font-serif">
                   {LOREM_IPSUM_PAGES[currentPage]}
                </CardContent>
            </Card>
        </div>
        
        {/* Footer */}
        <footer className="p-4 border-t bg-background sticky bottom-0 z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                 <div className='flex-grow text-center flex items-center gap-4 justify-center'>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <Progress value={progress} className="w-32 h-2" />
                </div>
                <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </footer>
    </div>
  );
}
