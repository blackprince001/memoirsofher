import CustomImage from "./shared/image";

interface IProps {
  author?: string;
  message: string;
  tags: string[];
  imageUrl: string;
  title: string;
}
const MemoryCard = ({
  author = "Anon",
  message,
  tags,
  imageUrl,
  title,
}: IProps) => {
  return (
    <div className=" cursor-pointer h-full  rounded-xl ">
      <CustomImage
        src={imageUrl}
        className="w-full  rounded-t-xl aspect-auto object-cover"
        height={Math.floor(Math.random() * (600 - 200 + 1)) + 200}
      />
      <div className="border-black/10 border-[1.2px]   rounded-b-xl shadow-sm px-3 py-2">
        <p className="text-[0.86rem] text-black/50 font-normal ">{author}</p>
        <h4 className="text-[0.98rem] font-light text-black/90">{title}</h4>
        <p className="font-extralight text-[0.87rem] text-black/95 mb-6">
          {message}
        </p>

        <div className="flex items-center gap-2">
          {tags
            ?.filter((tag) => tag.trim() != "")
            ?.map((tag) => (
              <p
                key={`${tag}-${author}`}
                className="text-black/80 text-[0.85rem] font-thin "
              >
                #{tag}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
