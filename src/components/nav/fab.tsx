"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useContext } from "react";
import { FiSettings } from "react-icons/fi";
import { GrSystem } from "react-icons/gr";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { FaPlus } from "react-icons/fa6";
import { AppContext } from "~/contexts/AppContext";

export default function Fab() {
  const { openCreateMeasurableModal } = useContext(AppContext);

  return (
    <div className="absolute right-4 bottom-6 flex flex-col gap-2">
      {/* FAB contents */}
      <FabMenuItems />

      {/* trigger */}
      <Button
        size="icon-lg"
        className="rounded-full"
        onClick={openCreateMeasurableModal}
      >
        <FaPlus />
      </Button>
    </div>
  );
}

const FabMenuItems = () => {
  // theme stuff
  const { theme, setTheme } = useTheme();
  const handleThemeToggle = () => {
    setTheme((prevTheme) => {
      if (prevTheme === "light") return "dark";
      if (prevTheme === "dark") return "system";
      return "light";
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-lg" className="rounded-full">
          <span>PMW</span>
          <span className="sr-only">Toggle theme and access settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36" align="start">
        <DropdownMenuGroup>
          <Link href="/settings">
            <DropdownMenuItem className="justify-between">
              Settings <FiSettings />
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* <DropdownMenuItem
            onClick={() => void authClient.signOut()}
            className="justify-between"
          >
            Sign out <FaSignOutAlt />
          </DropdownMenuItem> */}
          <DropdownMenuItem
            onClick={handleThemeToggle}
            className="justify-between"
          >
            Theme{" "}
            {theme === "light" ? (
              <Sun />
            ) : theme === "dark" ? (
              <Moon />
            ) : (
              <GrSystem />
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
