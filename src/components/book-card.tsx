import Image from "next/image";
import Link from "next/link";
import { Star, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Book = {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  imageHint: string;
  genre: string;
  rating: number;
  description: string;
};

type BookCardProps = {
  book: Book;
};

export function BookCard({ book }: BookCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full group border-border hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg">
      <CardHeader className="p-0 relative overflow-hidden">
        <Link href={`/read/${book.id}`}>
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
            href={`/read/${book.id}`}
            className="hover:text-primary transition-colors line-clamp-2"
          >
            {book.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">by {book.author}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-accent fill-current" />
          <span className="text-sm font-bold text-foreground/80">
            {book.rating.toFixed(1)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
          aria-label="Add to library"
        >
          <Bookmark className="w-5 h-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
