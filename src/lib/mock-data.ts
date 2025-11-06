import type { Book } from "@/components/book-card";

export const mockBooks: Book[] = [
  {
    id: "1342", // Pride and Prejudice
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverImage: "https://picsum.photos/seed/book1/300/450",
    imageHint: "regency couple",
    genre: "Romance",
    rating: 4.8,
    description: "A classic novel of manners, following the turbulent relationship between Elizabeth Bennet and Fitzwilliam Darcy.",
  },
  {
    id: "84", // Frankenstein
    title: "Frankenstein; Or, The Modern Prometheus",
    author: "Mary Wollstonecraft Shelley",
    coverImage: "https://picsum.photos/seed/book2/300/450",
    imageHint: "stormy castle",
    genre: "Gothic",
    rating: 4.6,
    description: "The story of a young science student who creates a sapient creature in an unorthodox scientific experiment.",
  },
  {
    id: "11", // Alice's Adventures in Wonderland
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    coverImage: "https://picsum.photos/seed/book3/300/450",
    imageHint: "fantasy forest",
    genre: "Fantasy",
    rating: 4.5,
    description: "A young girl named Alice falls through a rabbit hole into a fantasy world populated by peculiar, anthropomorphic creatures.",
  },
  {
    id: "1661", // The Adventures of Sherlock Holmes
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    coverImage: "https://picsum.photos/seed/book4/300/450",
    imageHint: "victorian street",
    genre: "Mystery",
    rating: 4.7,
    description: "A collection of twelve short stories featuring the famous detective Sherlock Holmes.",
  },
  {
    id: "2701", // Moby Dick
    title: "Moby Dick; Or, The Whale",
    author: "Herman Melville",
    coverImage: "https://picsum.photos/seed/book5/300/450",
    imageHint: "ocean storm",
    genre: "Adventure",
    rating: 4.4,
    description: "The narrative of the sailor Ishmael's perilous voyage aboard the whaling ship Pequod, led by the monomaniacal Captain Ahab.",
  },
  {
    id: "98", // A Tale of Two Cities
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    coverImage: "https://picsum.photos/seed/book6/300/450",
    imageHint: "french revolution",
    genre: "Historical",
    rating: 4.6,
    description: "A historical novel set in London and Paris before and during the French Revolution.",
  },
   {
    id: "64317", // The Great Gatsby
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverImage: "https://picsum.photos/seed/book7/300/450",
    imageHint: "roaring twenties",
    genre: "Classic",
    rating: 4.7,
    description: "A novel about the American dream, set in the Jazz Age on Long Island.",
  },
  {
    id: "76", // To Kill a Mockingbird - Not on Gutenberg, using another classic
    title: "Adventures of Huckleberry Finn",
    author: "Mark Twain",
    coverImage: "https://picsum.photos/seed/book8/300/450",
    imageHint: "river raft",
    genre: "Classic",
    rating: 4.8,
    description: "A novel about a young boy's adventures on the Mississippi River with a runaway slave.",
  },
];
