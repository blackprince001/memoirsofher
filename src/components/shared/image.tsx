import { cn } from "@/lib/utils";
import { useState } from "react";

import React from "react";

interface IProps {
  skeletonclassname?: string;
  height?: number;
}

const CustomImage = React.memo(
  (props: IProps & React.ImgHTMLAttributes<HTMLImageElement>) => {
    const [loaded, setLoaded] = useState(false);

    return (
      <div>
        <img
          {...props}
          onLoad={() => setLoaded(true)}       
          loading="lazy"
        />
        {!loaded && (
          <div
            style={{
              height: `${props.height}px`,
            }}
            className={cn(
              "bg-gray-200 animate-pulse",
              props.className as string
            )}
          ></div>
        )}
      </div>
    );
  },


);

export default CustomImage;
