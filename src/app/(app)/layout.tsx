"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Book,
  Home,
  Library,
  Loader2,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { ModeToggle } from "@/components/layout/mode-toggle";
import placeholderImagesData from "@/lib/placeholder-images.json";
import { useAuth, useUser, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { useEffect, useState } from "react";
import {motion} from 'framer-motion';
import { mockBooks } from "@/lib/mock-data";
import type { Book as BookType } from "@/components/book-card";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/library", label: "My Purchases", icon: Library },
    { href: "/search", label: "Browse", icon: Search },
    { href: "/upload", label: "Upload Book", icon: Upload }, // TODO: Admin only
  ];
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [isUserLoading, user, router]);

  // A one-time effect to populate Firestore with mock data if the collection is empty.
  useEffect(() => {
    async function seedDatabase() {
        if (firestore) {
            const { getDocs, collection, writeBatch, doc } = await import('firebase/firestore');
            const ebooksCollection = collection(firestore, 'ebooks');
            
            try {
                const snapshot = await getDocs(ebooksCollection);
                if (snapshot.empty) {
                    console.log('No books found, seeding database...');
                    const batch = writeBatch(firestore);
                    mockBooks.forEach((book) => {
                        const bookRef = doc(ebooksCollection, book.id);
                        batch.set(bookRef, book);
                    });
                    
                    // The batch.commit() is a non-blocking operation here.
                    // We attach a .catch to handle potential permission errors.
                    batch.commit().catch(serverError => {
                        console.log('Batch commit failed. This may be a permissions issue.');
                        // For a batch write, we can create a representative error.
                        // We'll use the collection path as a general indicator.
                        const permissionError = new FirestorePermissionError({
                            path: ebooksCollection.path,
                            operation: 'write', // Batch write involves creating/setting documents
                            requestResourceData: mockBooks.reduce((acc, book) => {
                                acc[book.id] = book;
                                return acc;
                            }, {} as Record<string, BookType>),
                        });
                        errorEmitter.emit('permission-error', permissionError);
                    });

                    console.log('Database seeding initiated.');
                }
            } catch (error) {
                // This catch block handles errors from getDocs.
                 if (error instanceof Error && error.message.includes('permission-denied')) {
                     const permissionError = new FirestorePermissionError({
                         path: ebooksCollection.path,
                         operation: 'list' // getDocs is a 'list' operation
                     });
                     errorEmitter.emit('permission-error', permissionError);
                 } else {
                    console.error("An unexpected error occurred during database seeding:", error);
                 }
            }
        }
    }
    seedDatabase();
  }, [firestore]);


  const handleLogout = () => {
    auth.signOut();
    router.push('/');
  };
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <Book className="h-6 w-6 text-primary" />
              <span className="font-headline">EBookVerse</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    pathname === item.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Book className="h-6 w-6 text-primary" />
                  <span className="font-headline">EBookVerse</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                      pathname === item.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search books..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName ?? user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
