import { useState } from "react";
import { cn } from "../../utils";

interface IProps {
  skeletonclassname?: string;
  height?: number
  
}
const CustomImage = (
  props: IProps & React.ImgHTMLAttributes<HTMLImageElement>
) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div>
      <img
        {...props}
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? "block" : "none" }}
      />
      {!loaded && (
        <div
        style={{ 
          height: `${props.height}px`
        }}
          className={cn(
            "bg-gray-200 animate-pulse ",

            props.className as string,
            // props.skeletonclassname as string
          )}
        ></div>
      )}
    </div>
  );
};

export default CustomImage;
