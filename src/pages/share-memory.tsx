import { Input } from "@/components/ui/input";
import NavBar from "../components/shared/nav";
import { Textarea } from "@/components/ui/textarea";
import { useFormik } from "formik";
import { supabaseClient } from "@/lib/supabase";
import React, { ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import MultipleSelector from "@/components/ui/multi-select";
import { ImageIcon } from "lucide-react";

const ValidationSchema = Yup.object().shape({
  name: Yup.string().optional(),
  title: Yup.string().required("Please add a title to your memory"),
  message: Yup.string().required("Please share your memory"),
  tags: Yup.array(Yup.string()).min(1, "Please select at least one connection"),
});

const ShareMemory = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [submiting, setSubmiting] = React.useState<boolean>(false);
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const { ...form } = useFormik({
    initialValues: {
      name: "",
      title: "",
      message: "",
      tags: [],
    },
    validationSchema: ValidationSchema,
    validateOnMount: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      if (!selectedFile) {
        toast.error("Please select an image to share");
        return;
      }

      setSubmiting(true);
      const fileName = `public/memory-${uuidv4()}`;
      toast.promise(
        supabaseClient.storage
          .from("images")
          .upload(fileName, selectedFile as File)
          .then(async () => {
            const {
              data: { publicUrl },
            } = supabaseClient.storage.from("images").getPublicUrl(fileName);
            const { error } = await supabaseClient.from("memory").insert({
              ...values,
              imgUrl: publicUrl,
            });

            if (!error) {
              toast.success("Thank you for sharing your memory of Jojo🤍");
              form.resetForm();
              navigate("/memories");
            }

            setSubmiting(false);
          }),
        {
          loading: "Uploading your memory🤍",
          error: "Failed to upload memory. Please try again.",
        }
      );
    },
  });

  return (
    <div className="min-h-screen w-full bg-neutral-50">
      <NavBar linkClass="text-black" underlineColor="bg-black" />
      
      <div className="container mx-auto px-4 py-16 lg:py-20">
        <h1 className="font-cursive font-extralight text-[2.4rem] lg:text-[5rem] text-center mb-12">
          Share A Memory
        </h1>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
            {/* Image Upload */}
            <div className="mb-8">
              <p className="font-medium text-black/70 mb-2">Add Image</p>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`block w-full rounded-lg border-2 border-dashed transition-colors cursor-pointer
                    ${imagePreview ? 'border-emerald-400' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  {imagePreview ? (
                    <div className="relative aspect-video">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <p className="text-white font-medium">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Click to upload an image or drag and drop
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {fields.map((field) => {
                const id = field.id as keyof typeof form.initialValues;
                switch (field.type) {
                  case "text":
                    return (
                      <div key={field.id}>
                        <label className="font-medium text-black/70 mb-2 block">
                          {field.label}
                        </label>
                        <Input
                          type="text"
                          value={form.values[id]}
                          id={field.id}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          placeholder={field.placeholder}
                        />
                        {form.touched[id] && form.errors[id] && (
                          <p className="mt-1 text-sm text-red-500">{form.errors[id]}</p>
                        )}
                      </div>
                    );

                  case "textarea":
                    return (
                      <div key={field.id}>
                        <label className="font-medium text-black/70 mb-2 block">
                          {field.label}
                        </label>
                        <Textarea
                          value={form.values[id]}
                          id={field.id}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          placeholder="Share a memory about Jojo..."
                          rows={5}
                          className="resize-none"
                        />
                        {form.touched[id] && form.errors[id] && (
                          <p className="mt-1 text-sm text-red-500">{form.errors[id]}</p>
                        )}
                      </div>
                    );

                  case "select":
                    return (
                      <div key={field.id}>
                        <label className="font-medium text-black/70 mb-2 block">
                          {field.label}
                        </label>
                        <MultipleSelector
                          value={form.values.tags?.map((opt) => ({
                            label: opt,
                            value: opt,
                          }))}
                          onChange={(values) => {
                            form.setFieldValue(
                              id,
                              values?.map((v) => v.label)
                            );
                          }}
                          hidePlaceholderWhenSelected
                          placeholder={field.placeholder}
                          defaultOptions={field.options?.map((opt) => ({
                            label: opt,
                            value: opt,
                          }))}
                        />
                        {form.touched[id] && form.errors[id] && (
                          <p className="mt-1 text-sm text-red-500">{form.errors[id]}</p>
                        )}
                      </div>
                    );
                }
              })}

              <button
                disabled={submiting}
                onClick={() => form.handleSubmit()}
                className="w-full bg-black hover:bg-black/90 disabled:bg-black/30 
                         text-white py-3 rounded-lg transition-colors duration-300
                         text-lg font-medium mt-8"
              >
                {submiting ? "Sharing Memory..." : "Share Memory"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const fields = [
  {
    type: "text",
    label: "Name (optional)",
    id: "name",
    placeholder: "e.g Sam",
  },
  {
    type: "text",
    label: "Title",
    id: "title",
    placeholder: "Give your memory a title",
  },
  {
    type: "textarea",
    label: "Message",
    id: "message",
    placeholder: "",
  },
  {
    type: "select",
    multiselect: true,
    options: [
      "Flowers_Gay",
      "WGHS_20",
      "COE_24",
      "Gey_Hey",
      "ACES",
      "GESA",
      "WinE",
      "New_Breed",
      "MSP",
      "KNUST",
      "Family",
      "Friend",
      "Colleague",
      "Childhood",
      "Church",
      "Other",
    ],
    id: "tags",
    placeholder: "e.g. KNUST",
    label: "How do you know Jojo?",
  },
];

export default ShareMemory;