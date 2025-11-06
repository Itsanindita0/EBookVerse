import { PublicHeader } from "@/components/layout/public-header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, Star } from "lucide-react";
import placeholderImagesData from "@/lib/placeholder-images.json";

export default function Home() {
  const { placeholderImages } = placeholderImagesData;
  const heroImage = placeholderImages.find((p) => p.id === "hero-reading");

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Welcome to EBookVerse
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Your personal gateway to a universe of books. Discover,
                    read, and manage your favorite e-books all in one place.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Link href="/dashboard">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/library">Browse Library</Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Read Without Limits
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  EBookVerse is packed with features to enhance your reading
                  experience.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">
                  Vast Library
                </h3>
                <p className="text-muted-foreground">
                  Access a huge collection of e-books across all genres.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">
                  Powerful Search
                </h3>
                <p className="text-muted-foreground">
                  Quickly find books by title, author, or genre with advanced
                  filters.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Star className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">
                  AI Recommendations
                </h3>
                <p className="text-muted-foreground">
                  Get personalized book suggestions based on your reading
                  habits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-muted-foreground">
            &copy; 2024 EBookVerse. All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4"
              prefetch={false}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4"
              prefetch={false}
            >
              Privacy
            </Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
