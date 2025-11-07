"use client";

import { TrophyIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { SiGoogletasks } from "react-icons/si";
import { TbCategory } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { AppContext } from "~/contexts/AppContext";
import { api } from "~/trpc/react";

export default function Nav() {
  const pathname = usePathname();
  const locations = [
    { name: "Home", href: "/" },
    { name: "Results", href: "/results" },
  ];

  const { data: areas } = api.area.findAll.useQuery();

  const { area, setArea } = useContext(AppContext);

  return (
    <div className="flex shrink-0 gap-1 overflow-hidden p-2">
      {/* leading menu items */}
      <div className="flex grow items-center gap-1 overflow-hidden">
        <Link href="/areas">
          <Button variant="outline" size={"icon"}>
            <TbCategory />
          </Button>
        </Link>

        <div className="flex grow gap-2 overflow-y-auto">
          <Button onClick={() => setArea(null)}>Uncategorized</Button>
          {areas?.map((area) => (
            <Link key={area.name} href={`/${area.name}`}>
              <Button variant="outline">{area.name}</Button>
            </Link>
          ))}
        </div>
      </div>

      {/* trailing menu items */}
      <div className="flex items-center gap-1">
        {locations.map((location) => {
          if (pathname === location.href) return null;
          return (
            <Link key={location.name} href={location.href}>
              <Button variant="outline">
                {location.name === "Home" ? <SiGoogletasks /> : <TrophyIcon />}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
