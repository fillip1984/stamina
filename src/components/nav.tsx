"use client";

import { TrophyIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiGoogletasks } from "react-icons/si";
import { TbCategory } from "react-icons/tb";
import { Button } from "~/components/ui/button";

export default function Nav() {
  const pathname = usePathname();

  const areas = [
    { name: "Area 1" },
    { name: "Area 2" },
    { name: "Area 3" },
    { name: "Area 4" },
    { name: "Area 5" },
    { name: "Area 6" },
    { name: "Area 7" },
    { name: "Area 8" },
    { name: "Area 9" },
    { name: "Area 10" },
  ];

  const locations = [
    { name: "Home", href: "/" },
    { name: "Results", href: "/results" },
  ];

  return (
    <div className="flex gap-1 overflow-hidden p-2">
      {/* leading menu items */}
      <div className="flex items-center gap-1 overflow-hidden">
        <Button variant="outline" size={"icon"}>
          <TbCategory />
        </Button>

        <div className="flex grow gap-2 overflow-y-auto">
          {areas.map((area) => (
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
