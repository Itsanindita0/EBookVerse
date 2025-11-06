'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { Book } from '@/components/book-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const bookRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'ebooks', params.id);
  }, [firestore, params.id]);

  const { data: book, isLoading: isLoadingBook } = useDoc<Book>(bookRef);

  const cartDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !book) return null;
    return doc(firestore, 'users', user.uid, 'cart', book.id);
  }, [firestore, user?.uid, book]);

  const { data: cartDoc } = useDoc(cartDocRef);
  const isInCart = !!cartDoc;

  const handleAddToCart = () => {
    if (!cartDocRef || !book) return;

    if (isInCart) {
      toast({
        title: 'Already in Cart',
        description: `${book.title} is already in your shopping cart.`,
      });
    } else {
      const cartItem = { ...book, quantity: 1 };
      setDocumentNonBlocking(cartDocRef, cartItem);
      toast({
        title: 'Added to Cart',
        description: `${book.title} has been added to your cart.`,
      });
    }
  };

  if (isLoadingBook) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Book not found</h1>
        <p className="text-muted-foreground">
          We couldn't find the book you were looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Image
            src={book.coverImage}
            alt={book.title}
            width={300}
            height={450}
            className="aspect-[2/3] w-full rounded-lg object-cover shadow-lg"
            data-ai-hint={book.imageHint}
          />
        </div>
        <div className="md:col-span-2">
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {book.genre}
              </Badge>
              <h1 className="text-4xl font-bold font-headline">{book.title}</h1>
              <p className="text-xl text-muted-foreground">by {book.author}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{book.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                ${book.price.toFixed(2)}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-muted-foreground">{book.description}</p>
            </div>

            <Button size="lg" onClick={handleAddToCart}>
              <ShoppingCart
                className={`mr-2 h-5 w-5 ${
                  isInCart ? 'text-white fill-white' : ''
                }`}
              />
              {isInCart ? 'In Cart' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
