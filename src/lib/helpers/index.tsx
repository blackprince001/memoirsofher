import { createClient } from '@supabase/supabase-js'
import { toast } from "sonner"
interface PromiseData {
    loading?: string;
    success?: string;
    error?: string | ((error: any) => string); // Allow error to be a string or a function for dynamic error messages
  }

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://ydwvzozpcuzqeudrhwnx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkd3Z6b3pwY3V6cWV1ZHJod254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2Mzg5OTYsImV4cCI6MjA1MDIxNDk5Nn0.-n3pTStRyG37yUUrqzjwNOGoeoAG31CMKKcbqnrqeHY')

export class ToastService {
    /**
     * Displays a promise-based toast notification for "get" operations.
     * @param promiseFunc - A function that returns a promise to execute.
     * @param data - Optional object for customizing toast messages.
     */
    public get(promiseFunc: () => Promise<any>, data?: PromiseData) {
      toast.promise(promiseFunc(), {
        loading: data?.loading ?? "Loading...",
        success: data?.success ?? "Successfully loaded data.",
        error: typeof data?.error === "function" ? data.error : data?.error ?? "Error loading data. Please try again later.",
      });
    }
  
    /**
     * Displays a promise-based toast notification for "post" operations.
     * @param promiseFunc - A function that returns a promise to execute.
     * @param data - Optional object for customizing toast messages.
     */
    public post(promiseFunc: () => Promise<any>, data?: PromiseData) {
      toast.promise(promiseFunc(), {
      
        loading: data?.loading ?? "Saving...",
        success: data?.success ?? "Successfully saved data.",
        error: typeof data?.error === "function" ? data.error : data?.error ?? "Error saving data. Please try again later.",
      });
    }
  
    // The same `PromiseData` can be used in other methods like `put` and `delete`
    public put(promiseFunc: () => Promise<any>, data?: PromiseData) {
      toast.promise(promiseFunc(), {
        loading: data?.loading ?? "Updating...",
        success: data?.success ?? "Successfully updated data.",
        error: typeof data?.error === "function" ? data.error : data?.error ?? "Error updating data. Please try again later.",
      });
    }
  
    public delete(promiseFunc: () => Promise<void>, data?: PromiseData) {
      toast.promise(promiseFunc(), {
      
        loading: data?.loading ?? "Deleting...",
        success: data?.success ?? "Successfully deleted data.",
        error: typeof data?.error === "function" ? data.error : data?.error ?? "Error deleting data. Please try again later.",
      });
    }
  }
  