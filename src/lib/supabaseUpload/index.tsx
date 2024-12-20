import { SupabaseClient } from "@supabase/supabase-js";
import { Memory } from "../schemas";

export const uploadImageToSupabase = async (
  file: File,
  values: Memory,
  supabase: SupabaseClient
): Promise<{ data: Memory | null; error: Error | null }> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { data: imageData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(`${fileName}`, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(`${fileName}`);

    const newMemory = {
      ...values,
      imageurl: urlData.publicUrl,
    };
    delete newMemory.imageFile;
    const { data, error: dbError } = await supabase
      .from("memories")
      .insert(newMemory)
      .select()
      .single();

    if (dbError) throw dbError;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};
