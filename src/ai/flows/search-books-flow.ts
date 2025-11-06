'use server';
/**
 * @fileOverview An AI agent that searches for books.
 *
 * - searchBooks - A function that handles the book searching process.
 * - SearchBooksInput - The input type for the searchBooks function.
 * - SearchBooksOutput - The return type for the searchBooks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { mockBooks } from '@/lib/mock-data';

const SearchBooksInputSchema = z.object({
  query: z.string().describe('The user\'s search query for books.'),
});
export type SearchBooksInput = z.infer<typeof SearchBooksInputSchema>;

const BookSchema = z.object({
    id: z.string().describe("A unique identifier for the book, if available from a known source like Project Gutenberg. Otherwise, a generated unique ID."),
    title: z.string().describe("The title of the book."),
    author: z.string().describe("The author of the book."),
    coverImage: z.string().describe("A URL for the book's cover image. Should be a placeholder from picsum.photos."),
    imageHint: z.string().describe("Two keywords for the cover image, for AI hint."),
    genre: z.string().describe("The genre of the book."),
    rating: z.number().describe("The book's rating, on a scale of 1-5."),
    description: z.string().describe("A short description of the book.")
});

const SearchBooksOutputSchema = z.object({
  books: z.array(BookSchema).describe('An array of books that match the search query.'),
});
export type SearchBooksOutput = z.infer<typeof SearchBooksOutputSchema>;

export async function searchBooks(input: SearchBooksInput): Promise<SearchBooksOutput> {
    if (!input.query) {
        return { books: mockBooks };
    }
  return searchBooksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchBooksPrompt',
  input: {schema: SearchBooksInputSchema},
  output: {schema: SearchBooksOutputSchema},
  prompt: `You are a book search engine. Based on the user's query, find relevant books. Return a list of books with their title, author, genre, a short description, and a rating. 
For each book, provide a unique ID (you can generate one if not available) and a placeholder cover image URL from picsum.photos (e.g., https://picsum.photos/seed/random-string/300/450). Also provide a two-word image hint for the cover.

User Query: {{query}}

Find up to 10 books.`,
});

const searchBooksFlow = ai.defineFlow(
  {
    name: 'searchBooksFlow',
    inputSchema: SearchBooksInputSchema,
    outputSchema: SearchBooksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
