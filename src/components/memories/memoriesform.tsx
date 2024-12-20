import { Memory, MemoryForm, MemorySchema } from "@/lib/schemas";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import SingleFileInput from "../singleImagepicker";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { supabase } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { uploadImageToSupabase } from "@/lib/supabaseUpload";
import { toast } from "sonner";

export default function MemoriesForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<MemoryForm>({
    defaultValues: {
      imageFile: undefined,
      name: "",
      tags: [],
      message: "",
    },
    resolver: zodResolver(MemorySchema),
  });

  const onSubmit: SubmitHandler<MemoryForm> = async (values) => {
    setLoading(true);
    try {
      //image upload also handles vreation
      //ill separate them
      const result = await uploadImageToSupabase(values.imageFile!, values, supabase);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success("Memory successfully uploaded!");
    } catch (error: any) {
      toast.error(`Failed to upload memory: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fruits = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Blueberry", value: "blueberry" },
    { label: "Grapes", value: "grapes" },
    { label: "Pineapple", value: "pineapple" },
  ];
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const handleCheckboxChange = (checked: boolean, value: string) => {
    if (checked) {
      append({ value });
    } else {
      const index = fields.findIndex((field) => field.value === value);
      if (index !== -1) {
        remove(index);
      }
    }
  };
//function to fetch memories
const fetchMemories = async () => {
  try {
    const { data, error } = await supabase
      .from("memories") // Replace "memories" with your table name
      .select("*"); // Select all fields, or specify fields like "id, name, tags"

    if (error) {
      console.error("Error fetching memories:", error);
      throw new Error(error.message);
    }
console.log("here",data)
    return data;
  } catch (err) {
    console.error("Error occurred:", err);
    return [];
  }
};

useEffect(()=>{
  fetchMemories()
},[])
  return (
    <Card className="p-5">
      <CardHeader>
        <CardTitle>Memory Form</CardTitle>
        <CardDescription>Fill out the details below</CardDescription>
      </CardHeader>
      <CardContent className="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid w-full md:grid-cols-2 gap-10">
              <div className="space-y-7">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea className="h-40" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem className="w-full">
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <div>
                          {fruits.map((fruit) => (
                            <div
                              key={fruit.value}
                              className="flex items-center space-x-2 p-2"
                            >
                              <Checkbox
                                checked={fields.some(
                                  (field) => field.value === fruit.value
                                )}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange(
                                    checked as boolean,
                                    fruit.value
                                  )
                                }
                              />
                              <span>{fruit.label}</span>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {fields.map((field, index) => (
                          <Badge
                            key={field.id}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => remove(index)}
                          >
                            {fruits.find((f) => f.value === field.value)?.label}
                            <span className="ml-1">×</span>
                          </Badge>
                        ))}
                      </div>
                      <FormDescription>
                        Select multiple fruits using checkboxes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Label className="text-white">Upload Flyer Image</Label>
                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field, fieldState }) => (
                    <SingleFileInput
                      field={field}
                      error={fieldState.error}
                      onChange={(file, base64) => field.onChange(file)}
                    />
                  )}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
