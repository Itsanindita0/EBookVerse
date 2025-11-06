
'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Book } from '@/components/book-card';
import { BookCard } from '@/components/book-card';
import { BookListItem } from '@/components/book-list-item';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { List, Grid, Search, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from 'use-debounce';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Query } from 'firebase/firestore';

type SortOption = 'title-asc' | 'title-desc' | 'author-asc' | 'author-desc';
type Layout = 'grid' | 'list';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [sortOption, setSortOption] = useState<SortOption>('title-asc');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [layout, setLayout] = useState<Layout>('grid');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const firestore = useFirestore();

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  const booksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = collection(firestore, 'ebooks');
    
    // This is a simple case-sensitive prefix search.
    // For a more robust search, you would typically use a dedicated search service 
    // like Algolia or Typesense, which can handle case-insensitivity, full-text search, and typos.
    if (debouncedSearchTerm) {
      const endTerm = debouncedSearchTerm.slice(0, -1) + String.fromCharCode(debouncedSearchTerm.charCodeAt(debouncedSearchTerm.length - 1) + 1);
      q = query(q, 
        where('title', '>=', debouncedSearchTerm),
        where('title', '<', endTerm)
      );
    }
    return q;
  }, [firestore, debouncedSearchTerm]);

  const { data: books, isLoading } = useCollection<Book>(booksQuery);

  const genres = useMemo(() => {
    const allGenres = new Set(books?.map((book) => book.genre) ?? []);
    return ['all', ...Array.from(allGenres)];
  }, [books]);

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books ? [...books] : [];

    if (selectedGenre !== 'all') {
      filtered = filtered.filter((book) => book.genre === selectedGenre);
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'author-asc':
          return a.author.localeCompare(b.author);
        case 'author-desc':
          return b.author.localeCompare(a.author);
        default:
          return 0;
      }
    });

    return filtered;
  }, [books, sortOption, selectedGenre]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Browse Books</h1>
            <p className="text-muted-foreground">Discover your next great read.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button
                variant={layout === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setLayout('grid')}
                aria-label="Grid view"
            >
                <Grid className="h-5 w-5" />
            </Button>
            <Button
                variant={layout === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setLayout('list')}
                aria-label="List view"
            >
                <List className="h-5 w-5" />
            </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative w-full md:w-1/2 lg:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all books by title..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={sortOption}
          onValueChange={(value) => setSortOption(value as SortOption)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="author-asc">Author (A-Z)</SelectItem>
            <SelectItem value="author-desc">Author (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedGenre} onValueChange={setSelectedGenre} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
             {genres.map((genre) => (
                <TabsTrigger key={genre} value={genre} className="capitalize">
                    {genre}
                </TabsTrigger>
            ))}
        </TabsList>
        
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredAndSortedBooks.length > 0 ? (
            layout === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {filteredAndSortedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedBooks.map((book) => (
                  <BookListItem key={book.id} book={book} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <p className="text-lg font-semibold">No books found.</p>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
