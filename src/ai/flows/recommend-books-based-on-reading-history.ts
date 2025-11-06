'use server';
/**
 * @fileOverview An AI agent that recommends books based on user reading history.
 *
 * - recommendBooksBasedOnReadingHistory - A function that handles the book recommendation process.
 * - RecommendBooksBasedOnReadingHistoryInput - The input type for the recommendBooksBasedOnReadingHistory function.
 * - RecommendBooksBasedOnReadingHistoryOutput - The return type for the recommendBooksBasedOnReadingHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendBooksBasedOnReadingHistoryInputSchema = z.object({
  readingHistory: z.array(z.string()).describe('An array of book titles the user has read.'),
  genrePreferences: z.array(z.string()).describe('An array of the user\'s preferred genres.'),
  ratings: z.record(z.number()).describe('A map of book titles to ratings (1-5).'),
});
export type RecommendBooksBasedOnReadingHistoryInput = z.infer<typeof RecommendBooksBasedOnReadingHistoryInputSchema>;

const RecommendBooksBasedOnReadingHistoryOutputSchema = z.object({
  recommendedBooks: z.array(z.string()).describe('An array of recommended book titles.'),
});
export type RecommendBooksBasedOnReadingHistoryOutput = z.infer<typeof RecommendBooksBasedOnReadingHistoryOutputSchema>;

export async function recommendBooksBasedOnReadingHistory(input: RecommendBooksBasedOnReadingHistoryInput): Promise<RecommendBooksBasedOnReadingHistoryOutput> {
  return recommendBooksBasedOnReadingHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendBooksBasedOnReadingHistoryPrompt',
  input: {schema: RecommendBooksBasedOnReadingHistoryInputSchema},
  output: {schema: RecommendBooksBasedOnReadingHistoryOutputSchema},
  prompt: `You are a book recommendation expert. Based on the user's reading history, genre preferences, and ratings, recommend books that the user might enjoy.\n\nReading History: {{readingHistory}}\nGenre Preferences: {{genrePreferences}}\nRatings: {{ratings}}\n\nRecommend books:`,
});

const recommendBooksBasedOnReadingHistoryFlow = ai.defineFlow(
  {
    name: 'recommendBooksBasedOnReadingHistoryFlow',
    inputSchema: RecommendBooksBasedOnReadingHistoryInputSchema,
    outputSchema: RecommendBooksBasedOnReadingHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
