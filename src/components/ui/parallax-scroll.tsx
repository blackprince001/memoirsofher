import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import MemoryCard from "../memory-card";

interface CardData {
  imgUrl: string;
  tags: string[];
  title: string;
  message: string;
  name?: string;
}

export const ParallaxScroll = ({
  cards,
  className,
}: {
  cards: CardData[][];
  className?: string;
}) => {
  const gridRef = useRef<any>(null);
  const { scrollYProgress } = useScroll();

  const translate = cards.map((_, index) =>
    useTransform(scrollYProgress, [0, 1], [0, index % 2 === 0 ? -200 : 200])
  );

  return (
    <div className={cn("h-full items-start w-full", className)} ref={gridRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-start w-full mx-auto gap-10">
        {cards.map((cardData, idx) => (
          <motion.div 
            className="grid gap-10 relative" 
            key={`grid-${idx}`}
            style={{ y: translate[idx] }}
          >
            {cardData.map((item, idx2) => (
              <div 
                key={`card-${idx}-${idx2}`}
                style={{ transform: 'translate3d(0, 0, 0)' }}
                className="relative"
              >
                <MemoryCard
                  tags={item.tags}
                  title={item.title}
                  message={item.message}
                  imageUrl={item.imgUrl}
                  author={item.name || "Anon"}
                />
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
};