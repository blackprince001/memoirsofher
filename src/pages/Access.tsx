import { ChangeEvent, useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { variable, wrapClick } from "@/utils";
import React from "react";

interface Memory {
  id: number;
  created_at: string;
  name: string;
  title: string;
  message: string;
  tags: string;
  imgUrl: string;
  showInGallery: boolean;
  isDeleted: boolean;
}

interface GalleryItem {
  id: number;
  created_at: string;
  imgUrl: string;
  isDeleted: boolean;
}

const ACCESS_CODE = variable.access_code;

const AccessPage = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isMemoriesLoading, setIsMemoriesLoading] = useState(true);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [deleting, setDeleting] = useState<{ id: number; type: 'memory' | 'gallery' } | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authorized = sessionStorage.getItem("access_authorized");
    if (authorized === "true") {
      setIsAuthorized(true);
      fetchData();
    } else {
      setIsMemoriesLoading(false);
      setIsGalleryLoading(false);
    }
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchMemories(), fetchGallery()]);
  };

  const fetchMemories = async () => {
    try {
      setIsMemoriesLoading(true);
      const { data, error } = await supabaseClient
        .from("memory")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      toast.error("Failed to fetch memories");
    } finally {
      setIsMemoriesLoading(false);
    }
  };

  const fetchGallery = async () => {
    try {
      setIsGalleryLoading(true);
      const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      toast.error("Failed to fetch gallery items");
    } finally {
      setIsGalleryLoading(false);
    }
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === ACCESS_CODE) {
      setIsAuthorized(true);
      sessionStorage.setItem("access_authorized", "true");
      fetchData();
    } else {
      toast.error("Invalid access code");
      navigate("/");
    }
  };

  const handleDelete = async (id: number, type: 'memory' | 'gallery', imgUrl: string) => {
    try {
      setDeleting({ id, type });
      const fileName = imgUrl.split("/").pop();
      if (!fileName) throw new Error("Invalid image URL");

      // Delete from storage
      const { error: storageError } = await supabaseClient.storage
        .from("images")
        .remove([`${type === 'gallery' ? 'gallery' : 'public'}/${fileName}`]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabaseClient
        .from(type)
        .update({ isDeleted: true })
        .eq("id", id);

      if (dbError) throw dbError;

      if (type === 'memory') {
        setMemories(memories.filter(m => m.id !== id));
      } else {
        setGalleryItems(galleryItems.filter(g => g.id !== id));
      }
      toast.success(`${type === 'memory' ? 'Memory' : 'Gallery item'} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleImageSubmitFromFile = async () => {
    const fileName = `gallery/image-${uuidv4()}`;
    toast.promise(
      supabaseClient.storage
        .from("images")
        .upload(fileName, selectedFile as File)
        .then(async () => {
          const {
            data: { publicUrl },
          } = supabaseClient.storage.from("images").getPublicUrl(fileName);
          await supabaseClient.from("gallery").insert({
            imgUrl: publicUrl,
          });

          setSelectedFile(null);
          fetchGallery();
        }),
      {
        loading: "Uploading image",
        success: "Image upload successful",
      }
    );
  };

  const handleShowInGallery = async (memory: Memory) => {
    try {
      await supabaseClient
        .from("memory")
        .update({ showInGallery: false })
        .eq("id", memory.id);

      await supabaseClient.from("gallery").insert({
        imgUrl: memory.imgUrl,
      });
    } catch (error) {
      toast.error("Failed to add to gallery");
    } finally {
      fetchData();
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background grid place-items-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <h1 className="font-cursive text-3xl text-center mb-6">Access Required</h1>
          <form onSubmit={handleAccessSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-black text-white rounded hover:bg-black/90 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="mt-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-cursive text-4xl lg:text-6xl">Content Management</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem("access_authorized");
              navigate("/");
            }}
            className="px-4 py-2 bg-black text-white rounded hover:bg-black/90 transition-colors"
          >
            Exit
          </button>
        </div>

        {/* Gallery Upload Section */}
        <div className="mb-12">
          <h2 className="font-cursive text-3xl mb-4">Gallery Upload</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Input
              onChange={handleFileChange}
              type="file"
              placeholder="Attach an image"
              accept="image/*"
              className="bg-white max-w-[24rem]"
            />
            <button
              className="mt-4 px-4 py-2 bg-black text-white rounded-md disabled:opacity-50"
              onClick={wrapClick(() => {
                if (selectedFile) {
                  handleImageSubmitFromFile();
                }
              })}
              disabled={!selectedFile}
            >
              Upload to Gallery
            </button>
          </div>
        </div>

        {/* Gallery Items Section */}
        <div className="mb-12">
          <h2 className="font-cursive text-3xl mb-4">Gallery Items</h2>
          {isGalleryLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-lg">Loading gallery items...</div>
            </div>
          ) : (
            <div className="grid gap-4">
              {galleryItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imgUrl}
                      alt="Gallery image"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <p className="text-sm text-gray-500">
                      Added on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id, 'gallery', item.imgUrl)}
                  disabled={deleting?.id === item.id}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {deleting?.id === item.id && deleting.type === 'gallery' ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Memories Section */}
        <div>
          <h2 className="font-cursive text-3xl mb-4">Memories</h2>
          {isMemoriesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-lg">Loading memories...</div>
            </div>
          ) : (
            <div className="grid gap-4">
              {memories.map((memory) => (
              <div
                key={memory.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <img
                      src={memory.imgUrl}
                      alt={memory.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium text-lg">{memory.title}</h3>
                      <p className="text-sm text-gray-600">
                        By {memory.name || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Posted on {new Date(memory.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDelete(memory.id, 'memory', memory.imgUrl)}
                    disabled={deleting?.id === memory.id}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {deleting?.id === memory.id && deleting.type === 'memory' ? "Deleting..." : "Delete"}
                  </button>

                  {!memory.showInGallery && (
                    <button
                      onClick={() => handleShowInGallery(memory)}
                      className="px-4 py-2 bg-black text-white rounded hover:bg-black/90 transition-colors disabled:opacity-50"
                    >
                      Add to gallery
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessPage;