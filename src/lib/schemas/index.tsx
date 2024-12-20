import { z } from 'zod';

// Schema for form input
export const MemoryFormSchema = z.object({
  id: z.number().optional(),
  imageFile: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024; // 5MB limit
    }, "File must be 5MB or less"),
  message: z.string().min(50, "Message must be at least 50 characters"),
  name: z.string().optional(),
  tags: z.array(
    z.object({
      name: z.string().optional(),
      value: z.string()
    })
  )
});

// Schema for database
export const MemorySchema = MemoryFormSchema.extend({
  imageurl: z.string().url().optional()
});

export type MemoryForm = z.infer<typeof MemoryFormSchema>;
export type Memory = z.infer<typeof MemorySchema>;