"use client";

import { TrophyIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { FaPlus } from "react-icons/fa6";
import { SiGoogletasks } from "react-icons/si";
import ThemeToggle from "~/components/theme/themeToggle";
import { Button } from "~/components/ui/button";
import { AppContext } from "~/contexts/AppContext";

export default function Nav() {
  const { isCreateMeasurableModalOpen, openCreateMeasurableModal } =
    useContext(AppContext);

  const pathname = usePathname();

  return (
    <div className="flex justify-end gap-2 p-2">
      <ThemeToggle />
      {pathname !== "/results" ? (
        <>
          <Link href="/results">
            <Button variant="outline">
              <TrophyIcon />
            </Button>
          </Link>
          <Button className="rounded-full" onClick={openCreateMeasurableModal}>
            <FaPlus />
          </Button>
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
