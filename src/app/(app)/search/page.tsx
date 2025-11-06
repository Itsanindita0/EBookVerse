
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from 'use-debounce';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, Query } from 'firebase/firestore';
import { mockBooks } from '@/lib/mock-data';

type SortOption = 'title-asc' | 'title-desc' | 'author-asc' | 'author-desc';
type Layout = 'grid' | 'list';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('title-asc');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [layout, setLayout] = useState<Layout>('grid');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const firestore = useFirestore();

  const booksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = collection(firestore, 'ebooks');
    if (debouncedSearchTerm) {
      // Note: Firestore doesn't support full-text search natively.
      // This is a simple prefix search. For more complex scenarios,
      // a third-party search service like Algolia or Typesense is recommended.
      // We are querying by title here. A more robust solution would involve
      // querying by author as well, but that requires composite indexes.
       q = query(q, where('title', '>=', debouncedSearchTerm), where('title', '<=', debouncedSearchTerm + '\uf8ff'));
    }
    return q;
  }, [firestore, debouncedSearchTerm]);

  // If there's no search term, load all books.
  const allBooksQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'ebooks');
  }, [firestore]);


  const { data: allBooks, isLoading: isLoadingAllBooks } = useCollection<Book>(allBooksQuery, {
      skip: !!debouncedSearchTerm
  });
  
  const { data: searchedBooks, isLoading: isLoadingSearch } = useCollection<Book>(booksQuery, {
      skip: !debouncedSearchTerm
  });

  const books = debouncedSearchTerm ? searchedBooks : allBooks;
  const isLoading = isLoadingAllBooks || isLoadingSearch;


  const genres = useMemo(() => {
    const allGenres = new Set(allBooks?.map((book) => book.genre) ?? []);
    return ['all', ...Array.from(allGenres)];
  }, [allBooks]);

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books ? [...books] : [];

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter((book) => book.genre === selectedGenre);
    }

    // Sort books
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
  
  // A one-time effect to populate Firestore with mock data if the collection is empty.
  useEffect(() => {
    async function seedDatabase() {
        if (firestore) {
            const ebooksCollection = collection(firestore, 'ebooks');
            const snapshot = await getDocs(ebooksCollection);
            if (snapshot.empty) {
                console.log('No books found, seeding database...');
                const { setDoc, doc } = await import('firebase/firestore');
                const writeBatch = (await import('firebase/firestore')).writeBatch(firestore);
                mockBooks.forEach((book) => {
                    const bookRef = doc(ebooksCollection, book.id);
                    writeBatch.set(bookRef, book);
                });
                await writeBatch.commit();
                console.log('Database seeded with mock books.');
            }
        }
    }
    seedDatabase();
  }, [firestore]);


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
