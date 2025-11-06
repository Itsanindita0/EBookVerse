
'use client';

import { useState, useMemo } from 'react';
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

type SortOption = 'title-asc' | 'title-desc' | 'author-asc' | 'author-desc';
type Layout = 'grid' | 'list';

export default function LibraryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const libraryQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'library');
  }, [firestore, user?.uid]);
  
  const { data: libraryBooks, isLoading: isLoadingLibrary } = useCollection<Book>(libraryQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('title-asc');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [layout, setLayout] = useState<Layout>('grid');

  const genres = useMemo(() => {
    if (!libraryBooks) return ['all'];
    const allGenres = new Set(libraryBooks.map((book) => book.genre));
    return ['all', ...Array.from(allGenres)];
  }, [libraryBooks]);

  const filteredAndSortedBooks = useMemo(() => {
    let books = libraryBooks ? [...libraryBooks] : [];

    // Filter by genre
    if (selectedGenre !== 'all') {
      books = books.filter((book) => book.genre === selectedGenre);
    }

    // Filter by search term
    if (searchTerm) {
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort books
    books.sort((a, b) => {
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

    return books;
  }, [libraryBooks, searchTerm, sortOption, selectedGenre]);
  
  if (isLoadingLibrary) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">My Purchased Books</h1>
            <p className="text-muted-foreground">Browse your collection of purchased books.</p>
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
            placeholder="Search by title or author..."
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

        <TabsContent value={selectedGenre}>
            {filteredAndSortedBooks.length > 0 ? (
                layout === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mt-6">
                    {filteredAndSortedBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                    ))}
                </div>
                ) : (
                <div className="mt-6 space-y-4">
                    {filteredAndSortedBooks.map((book) => (
                        <BookListItem key={book.id} book={book} />
                    ))}
                </div>
                )
            ) : (
                <div className="text-center py-16">
                    <p className="text-lg font-semibold">Your library is empty.</p>
                    <p className="text-muted-foreground">Purchase books from the browse section to get started.</p>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
