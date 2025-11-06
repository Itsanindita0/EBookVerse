
'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export type Book = {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  imageHint: string;
  genre: string;
  rating: number;
  description: string;
  price: number;
};

type BookCardProps = {
  book: Book;
};

export function BookCard({ book }: BookCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const cartDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid, 'cart', book.id);
  }, [firestore, user?.uid, book.id]);

  const { data: cartDoc } = useDoc(cartDocRef);

  const isInCart = !!cartDoc;

  const handleAddToCart = () => {
    if (!cartDocRef) return;

    if (isInCart) {
      // Optional: Navigate to cart or show message
      toast({ title: "Already in Cart", description: `${book.title} is already in your shopping cart.` });
    } else {
      const cartItem = { ...book, quantity: 1 };
      setDocumentNonBlocking(cartDocRef, cartItem);
      toast({ title: "Added to Cart", description: `${book.title} has been added to your cart.` });
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full group border-border hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0 relative overflow-hidden">
        <Link href={`/book/${book.id}`}>
          <Image
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            width={300}
            height={450}
            className="object-cover w-full aspect-[2/3] transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={book.imageHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="outline" className="mb-2 font-normal">
          {book.genre}
        </Badge>
        <CardTitle className="text-lg leading-tight font-headline">
          <Link
            href={`/book/${book.id}`}
            className="hover:text-primary transition-colors line-clamp-2"
          >
            {book.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">by {book.author}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-primary">
            ${book.price.toFixed(2)}
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="text-muted-foreground hover:text-primary"
          aria-label="Add to cart"
          onClick={handleAddToCart}
        >
          <ShoppingCart className={`w-5 h-5 ${isInCart ? 'text-primary fill-primary' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  );
}
