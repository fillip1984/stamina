"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { GrSystem } from "react-icons/gr";
import { FaFileExport } from "react-icons/fa6";
import { FiDownloadCloud, FiUploadCloud } from "react-icons/fi";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, type ChangeEvent } from "react";
import { AppContext } from "~/contexts/AppContext";
import type { AreaType, MeasurableType } from "~/trpc/types";

export default function SettingsFab() {
  const router = useRouter();

  // theme stuff
  const { theme, setTheme } = useTheme();
  const handleThemeToggle = () => {
    setTheme((prevTheme) => {
      if (prevTheme === "light") return "dark";
      if (prevTheme === "dark") return "system";
      return "light";
    });
  };

  // export/import data stuff
  const utils = api.useUtils();
  const { mutate: exportData } = api.admin.exportData.useMutation({
    onSuccess: (data) => {
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([JSON.stringify(data)]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${new Date().toLocaleString()} stamina_backup.json`,
      );

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    },
  });
  const { mutate: importData } = api.admin.importData.useMutation({
    onSuccess: () => {
      // toast.success("Vendor file uploaded", {
      //   duration: 4000,
      //   position: "top-center",
      // });
      void utils.measurable.invalidate();
      void utils.area.invalidate();
      void router.push("/");
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerFileBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => processFile(file));
    }
  };

  const processFile = (file: File) => {
    try {
      const fr = new FileReader();
      fr.onload = convertFileToDataUrl;
      fr.readAsDataURL(file);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const convertFileToDataUrl = (e: ProgressEvent<FileReader>) => {
    const dataUrlString = e.target?.result;
    const dataUrl = dataUrlString as string;
    const data = dataUrl.split(",")[1]!;
    const buffer = Buffer.from(data, "base64");
    const string = buffer.toString();
    const json = JSON.parse(string) as {
      areas: AreaType[];
      measurables: MeasurableType[];
    };
    const areas = json.areas;
    const measurables = json.measurables.map((measurable) => ({
      ...measurable,
      setDate: new Date(measurable.setDate),
      dueDate: measurable.dueDate ? new Date(measurable.dueDate) : null,
      interval: measurable.interval ?? undefined,
    }));
    if (areas && measurables) {
      importData({ areas, measurables });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-lg" className="rounded-full">
          <span>PMW</span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => exportData()}
            className="justify-between"
          >
            Export <FiDownloadCloud />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={triggerFileBrowse}
            className="justify-between"
          >
            Import <FiUploadCloud />
          </DropdownMenuItem>
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        multiple={true}
        className="hidden"
        onChange={handleFileChange}
      />
    </DropdownMenu>
  );
}
