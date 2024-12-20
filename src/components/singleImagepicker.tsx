import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { ControllerRenderProps, FieldError } from "react-hook-form";
import { Memory, MemoryForm } from "@/lib/schemas";


const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const SingleFileInput = ({
  onChange,
  field,
  error
}: {
  onChange?: (file: File | null, base64?: string | null) => void;
  field: ControllerRenderProps<MemoryForm, "imageFile">;
  error?: FieldError;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

 

  const handleFileChange = (newFiles: File[]) => {
    const selectedFile = newFiles[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBase64(base64String);
        onChange && onChange(selectedFile, base64String);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setBase64(null);
      onChange && onChange(null, null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  const showFilePreview = file || base64;

  return (
    <>
      <Card
        className={`w-full bg-foreground border-none ${showFilePreview ? "h-fit" : "h-[240px]"}`}
        {...getRootProps()}
      >
        <motion.div
          onClick={handleClick}
          whileHover="animate"
          className={`group/file block rounded-lg cursor-pointer w-full relative overflow-hidden ${showFilePreview ? "" : "py-5"}`}
        >
          <input
            ref={fileInputRef}
            id="file-upload-handle"
            type="file"
            onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
            className="hidden"
            multiple={false}
          />

          <div className="flex flex-col items-center justify-center">
            <div className={`relative w-full ${showFilePreview ? "" : "mt-5 max-w-xl"}`}>
              {showFilePreview && (
                <motion.div
                  layoutId="file-upload"
                  className={cn(
                    "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-full p-4 w-full mx-auto rounded-md",
                    "shadow-sm"
                  )}
                >
                  {base64 && (
                    <img
                      src={base64}
                      alt="Uploaded file"
                      className="w-full max-5-60 object-cover rounded-md mb-2"
                    />
                  )}

                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {file ? file.name : "Previously uploaded image"}
                    </motion.p>
                    {file && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                      >
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </motion.p>
                    )}
                  </div>

                  {file && (
                    <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800"
                      >
                        {file.type}
                      </motion.p>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                      >
                        modified {new Date(file.lastModified).toLocaleDateString()}
                      </motion.p>
                    </div>
                  )}
                </motion.div>
              )}
              {!showFilePreview && (
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center"
                    >
                      Drop it
                      <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>
              )}

              {!showFilePreview && (
                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                ></motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </Card>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 mt-2 text-sm"
        >
          Please select a flyer image
        </motion.p>
      )}
    </>
  );
};

export default SingleFileInput;