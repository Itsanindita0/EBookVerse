
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useUser } from '@/firebase';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  photo: z
    .any()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  payoutDetails: z.string().optional(),
});

export function ProfileForm() {
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      photo: undefined,
      payoutDetails: '',
    },
  });

  const { isSubmitting } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Implement actual profile update logic, including payout details
    console.log(values);
    toast({
      title: 'Profile Updated!',
      description: 'Your profile information has been saved. (Placeholder)',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <Input type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <FormDescription>
                Upload a new profile picture. Accepted formats: JPG, PNG, WebP.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />
        
        <div>
            <h3 className="text-lg font-medium">Payout Information</h3>
            <p className="text-sm text-muted-foreground">This is where payments for your book sales will be sent.</p>
        </div>

        <FormField
          control={form.control}
          name="payoutDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Details</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Bank Name, Account Number, PayPal email, etc." {...field} className="min-h-[120px]" />
              </FormControl>
              <FormDescription>
                Enter the account details where you'd like to receive payments. This is a placeholder and is not stored securely.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
