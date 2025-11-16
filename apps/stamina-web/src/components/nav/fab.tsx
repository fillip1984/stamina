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
import { AppContext } from "apps/stamina-web/src/contexts/AppContext";
import { authClient } from "apps/stamina-web/src/server/auth/client";
import { se } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Session } from "apps/stamina-web/src/server/auth";
import { FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Fab() {
  const { data: session } = authClient.useSession();
  const { openCreateMeasurableModal } = useContext(AppContext);

  if (!session) return null;

  return (
    <div className="absolute right-4 bottom-6 flex flex-col gap-2">
      {/* FAB contents */}
      <FabMenuItems session={session} />

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

const FabMenuItems = ({ session }: { session: Session }) => {
  // theme stuff
  const { theme, setTheme } = useTheme();
  const handleThemeToggle = () => {
    setTheme((prevTheme) => {
      if (prevTheme === "light") return "dark";
      if (prevTheme === "dark") return "system";
      return "light";
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("");
  };

  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-10 select-none">
          <AvatarImage src={session.user.image ?? undefined} />
          <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
        </Avatar>
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
          <DropdownMenuItem onClick={handleSignOut} className="justify-between">
            Sign out <FaSignOutAlt />
          </DropdownMenuItem>
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
