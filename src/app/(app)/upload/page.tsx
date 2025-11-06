
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_BOOK_TYPES = ['application/pdf', 'application/epub+zip'];

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000),
  genre: z.string().min(2, { message: 'Genre must be at least 2 characters.' }).max(50),
  coverImage: z
    .any()
    .refine((files) => files?.length == 1, 'Cover image is required.')
    .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), '.jpg, .jpeg, .png and .webp files are accepted.'),
  bookFile: z
    .any()
    .refine((files) => files?.length == 1, 'Book file is required.')
    .refine((files) => ACCEPTED_BOOK_TYPES.includes(files?.[0]?.type), 'Only .pdf and .epub files are accepted.'),
});

export default function UploadPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      genre: '',
      coverImage: undefined,
      bookFile: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Implement actual file upload to Firebase Storage
    console.log(values);
    toast({
      title: 'Upload Submitted!',
      description: 'Your book is being processed. This is a placeholder.',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Upload Your Book</h1>
          <p className="text-muted-foreground">
            Share your story with the world. Fill out the form below.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Book Details</CardTitle>
          <CardDescription>
            Provide information about your book and upload the necessary files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book Title</FormLabel>
                    <FormControl>
                      <Input placeholder="The Great American Novel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief summary of your book..."
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sci-Fi, Fantasy, Romance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                        <Input type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={(e) => field.onChange(e.target.files)} />
                    </FormControl>
                    <FormDescription>
                      Accepted formats: JPG, PNG, WebP.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="bookFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book File</FormLabel>
                    <FormControl>
                      <Input type="file" accept={ACCEPTED_BOOK_TYPES.join(',')} onChange={(e) => field.onChange(e.target.files)} />
                    </FormControl>
                     <FormDescription>
                      Accepted formats: PDF, EPUB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                Upload Book
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
