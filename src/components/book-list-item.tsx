
'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Book } from "./book-card";
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";


type BookListItemProps = {
  book: Book;
};

export function BookListItem({ book }: BookListItemProps) {
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
        toast({ title: "Already in Cart", description: `${book.title} is already in your shopping cart.` });
    } else {
        const cartItem = { ...book, quantity: 1 };
        setDocumentNonBlocking(cartDocRef, cartItem);
        toast({ title: "Added to Cart", description: `${book.title} has been added to your cart.` });
    }
  };
  
  return (
    <Card className="flex items-center p-4 hover:bg-muted/50 transition-colors w-full">
      <Link href={`/book/${book.id}`} className="flex-shrink-0">
        <Image
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          width={80}
          height={120}
          className="rounded-md object-cover aspect-[2/3]"
          data-ai-hint={book.imageHint}
        />
      </Link>
      <CardContent className="flex-grow p-0 pl-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 items-center">
        <div className="sm:col-span-2 md:col-span-3">
            <Badge variant="outline" className="mb-2 font-normal hidden sm:inline-flex">
                {book.genre}
            </Badge>
            <h3 className="font-semibold line-clamp-2 font-headline text-lg">
                <Link href={`/book/${book.id}`} className="hover:text-primary transition-colors">
                    {book.title}
                </Link>
            </h3>
            <p className="text-sm text-muted-foreground">by {book.author}</p>
            <p className="text-md font-bold text-primary mt-2 sm:hidden">${book.price.toFixed(2)}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1 justify-center">
           <span className="text-xl font-bold text-primary">${book.price.toFixed(2)}</span>
        </div>
      </CardContent>
       <div className="flex items-center ml-4">
            <Button
                variant="outline"
                size="default"
                className="text-muted-foreground hover:text-primary hidden md:flex"
                aria-label="Add to cart"
                onClick={handleAddToCart}
            >
                <ShoppingCart className={`w-5 h-5 mr-2 ${isInCart ? 'text-primary fill-primary' : ''}`} />
                Add to Cart
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary md:hidden"
                aria-label="Add to cart"
                onClick={handleAddToCart}
            >
                <ShoppingCart className={`w-5 h-5 ${isInCart ? 'text-primary fill-primary' : ''}`} />
            </Button>
             <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                aria-label="More options"
            >
                <MoreVertical className="w-5 h-5" />
            </Button>
       </div>
    </Card>
  );
}
