import Image from "next/image";
import Link from "next/link";
import { Star, Bookmark, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Book } from "./book-card";

type BookListItemProps = {
  book: Book;
};

export function BookListItem({ book }: BookListItemProps) {
  return (
    <Card className="flex items-center p-4 hover:bg-muted/50 transition-colors w-full">
      <Link href={`/books/${book.id}`} className="flex-shrink-0">
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
                <Link href={`/books/${book.id}`} className="hover:text-primary transition-colors">
                    {book.title}
                </Link>
            </h3>
            <p className="text-sm text-muted-foreground">by {book.author}</p>
            <div className="flex items-center gap-1 mt-2 sm:hidden">
              <Star className="w-4 h-4 text-accent fill-current" />
              <span className="text-sm font-bold text-foreground/80">
                {book.rating.toFixed(1)}
              </span>
            </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 justify-center">
          <Star className="w-5 h-5 text-accent fill-current" />
          <span className="text-md font-bold text-foreground/80">
            {book.rating.toFixed(1)}
          </span>
        </div>
      </CardContent>
       <div className="flex items-center ml-4">
            <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                aria-label="Add to library"
            >
                <Bookmark className="w-5 h-5" />
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
