import { supabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { splitArrayRoundRobin } from "@/utils";
// import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "@/components/shared/nav";
import { ParallaxScroll } from "@/components/ui/parallax-scroll";

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

     
        {loading ? (
         <div className="grid lg:grid-cols-5 gap-4 md:grid-cols-3">
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
          </div>
        ) : (
          <>
             <ParallaxScroll className=" w-full h-full" cards={data} />;
          </>
        )}
      </div>

  );
};

export default MemoriesPage;
