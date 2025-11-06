'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import type { Book } from '@/components/book-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

type CartItem = Book & { quantity: number };

export default function CartPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const cartQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'cart');
  }, [firestore, user?.uid]);

  const { data: cartItems, isLoading } = useCollection<CartItem>(cartQuery);

  const subtotal = useMemo(() => {
    return cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) ?? 0;
  }, [cartItems]);

  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleRemoveItem = (bookId: string) => {
    if (!firestore || !user?.uid) return;
    const itemRef = doc(firestore, 'users', user.uid, 'cart', bookId);
    deleteDocumentNonBlocking(itemRef);
    toast({
        title: "Item Removed",
        description: "The book has been removed from your cart.",
    })
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Shopping Cart</h1>
        <p className="text-muted-foreground">Review your items before checking out.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {cartItems && cartItems.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4">
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        width={80}
                        height={120}
                        className="aspect-[2/3] rounded-md object-cover"
                        data-ai-hint={item.imageHint}
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">by {item.author}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <h3 className="text-xl font-semibold">Your cart is empty</h3>
                <p className="text-muted-foreground">Find your next favorite book in our store.</p>
                <Button asChild className="mt-4">
                  <Link href="/search">Browse Books</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild disabled={!cartItems || cartItems.length === 0}>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
