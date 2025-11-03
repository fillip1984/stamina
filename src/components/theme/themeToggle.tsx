"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { GrSystem } from "react-icons/gr";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function ThemeToggle() {
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
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36" align="start">
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
}
