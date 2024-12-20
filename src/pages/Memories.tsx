import { supabaseClient } from "@/lib/supabase";
import MemoryCard from "../components/memory-card";
import { useEffect, useState } from "react";
import { splitArrayRoundRobin } from "@/utils";
// import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "@/components/shared/nav";

const MemoriesPage = () => {
  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  async function fetchAllMemories() {
    setLoading(true);

    const { data: Memories, error } = await supabaseClient
      .from("memory")
      .select()
      .order("created_at", { ascending: false });

    if (data && !error) {
      setLoading(false);
    }
    setData(() => splitArrayRoundRobin(Memories as any[], 5));
  }

  useEffect(() => {
    fetchAllMemories();
  }, []);
  // const navigate = useNavigate();

  // const { pathname } = useLocation();
  // const other_pages = [
  //   {
  //     link: "/memories",
  //     title: "Memories",
  //   },
  //   {
  //     link: "/home",
  //     title: "Home",
  //   },
  //   {
  //     link: "/gallery",
  //     title: "Gallery",
  //   },
  //   {
  //     link: "/share-memory",
  //     title: "Share a memory",
  //   },
  // ];
  return (
    <div className=" px-4 lg:mx-auto relative  pb-10 ">
      <NavBar
        linkClass="hover:border-b-black text-black border-transparent"
        undelinecolor="border-b-black"
      />
      <h4 className="text-center font-cursive lg:text-[4.8rem] text-[2.3rem] mb-4 pt-[4.5rem] ">
        Memory Wall
      </h4>

      <div className="grid lg:grid-cols-5 gap-4 md:grid-cols-3">
        {loading ? (
          <>
            {splitArrayRoundRobin(
              Array.from(
                { length: 10 },
                () => Math.floor(Math.random() * (600 - 200 + 1)) + 200
              ),
              5
            )?.map((skel) => {
              return (
                <div
                  className="flex flex-col h-fit gap-4"
                  key={Math.random() * (600 - 200 + 1)}
                >
                  {skel?.map((i) => (
                    <div
                      key={i}
                      className="w-full bg-gray-200 animate-pulse rounded-lg"
                      style={{
                        height: `${i}px`,
                      }}
                    ></div>
                  ))}
                </div>
              );
            })}
          </>
        ) : (
          <>
            {data?.map((col, inx) => {
              return (
                <div className="flex flex-col h-fit gap-4" key={inx}>
                  {col.map((cardData: any) => {
                    return (
                      <MemoryCard
                        key={cardData?.imgUrl}
                        tags={cardData?.tags}
                        title={cardData?.title}
                        message={cardData?.message}
                        imageUrl={cardData?.imgUrl}
                        author={cardData?.name || "Anon"}
                      />
                    );
                  })}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default MemoriesPage;
