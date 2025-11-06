"use client";

import { TrophyIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { FaPlus } from "react-icons/fa6";
import { SiGoogletasks } from "react-icons/si";
import ThemeToggle from "~/components/settingsFab";
import { Button } from "~/components/ui/button";
import { AppContext } from "~/contexts/AppContext";

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="flex justify-end gap-2 p-2">
      {pathname !== "/results" ? (
        <>
          <Link href="/results">
            <Button variant="outline">
              <TrophyIcon />
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link href="/">
            <Button variant="outline">
              <SiGoogletasks />
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
