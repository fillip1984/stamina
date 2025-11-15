"use client";

import { TrophyIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { SiGoogletasks } from "react-icons/si";
import { TbCategory } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { AllAreas, AppContext } from "~/contexts/AppContext";
import { authClient } from "~/server/auth/client";
import { api } from "~/trpc/react";
import { Badge } from "../ui/badge";

export default function Nav() {
  const { data: session } = authClient.useSession();

  const pathname = usePathname();
  const locations = [
    { name: "Home", href: "/" },
    { name: "Results", href: "/results" },
  ];

  const { data: areas, isLoading } = api.area.findAll.useQuery(undefined, {
    enabled: !!session,
  });

  const { areaFilter, setAreaFilter } = useContext(AppContext);

  if (!session?.user) return null;

  return (
    <div className="flex shrink-0 gap-1 overflow-hidden p-2">
      {/* leading menu items */}
      <div className="flex grow items-center gap-1 overflow-hidden">
        <Link href="/areas">
          <Button variant="outline" size={"icon"}>
            <TbCategory />
          </Button>
        </Link>
        {!isLoading && (
          <div className="flex grow items-center gap-2 overflow-y-auto py-2">
            <Badge
              variant={areaFilter?.id === "All" ? "default" : "outline"}
              onClick={() => setAreaFilter(AllAreas)}
              className="cursor-pointer"
            >
              All
            </Badge>
            {areas?.map((area) => (
              <Badge
                key={area.id}
                variant={areaFilter?.id === area.id ? "default" : "outline"}
                onClick={() => setAreaFilter(area)}
                className="cursor-pointer"
              >
                {area.name}
              </Badge>
            ))}
            <Badge
              variant={areaFilter === null ? "default" : "outline"}
              onClick={() => setAreaFilter(null)}
              className="cursor-pointer"
            >
              Uncategorized
            </Badge>
          </div>
        )}
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
