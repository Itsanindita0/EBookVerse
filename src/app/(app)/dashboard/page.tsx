import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { mockBooks } from "@/lib/mock-data";
import { Activity, BookCopy, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const continueReading = mockBooks.slice(0, 3);
  const recommendedBooks = [...mockBooks].reverse();
  const recentlyAdded = mockBooks.slice(3, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, Reader!</h1>
        <p className="text-muted-foreground">Here's a snapshot of your reading journey.</p>
      </div>


      {/* Reading Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books Read</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent Reading</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32h 45m</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Reading */}
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Continue Reading</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {continueReading.map((book) => (
            <Card key={book.id} className="flex items-center gap-4 p-2 hover:bg-muted/50 transition-colors">
              <Image
                src={book.coverImage}
                alt={book.title}
                width={80}
                height={120}
                className="rounded-md object-cover aspect-[2/3]"
                data-ai-hint={book.imageHint}
              />
              <div className="flex-grow pr-4 py-2">
                <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1">
                  <Link href={`/read/${book.id}`}>Resume reading</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Recommended Books */}
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Recommended For You</h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {recommendedBooks.map((book) => (
              <CarouselItem key={book.id} className="sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1">
                  <BookCard book={book} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12" />
          <CarouselNext className="mr-12" />
        </Carousel>
      </div>

      {/* Recently Added */}
       <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Recently Added</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {recentlyAdded.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>

    </div>
  );
}
