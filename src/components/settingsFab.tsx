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
  const { mutate: exportMeasurables } = api.measurable.exportData.useMutation({
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
  const { mutate: importMeasurables } = api.measurable.importData.useMutation({
    onSuccess: () => {
      // toast.success("Vendor file uploaded", {
      //   duration: 4000,
      //   position: "top-center",
      // });
      void utils.measurable.invalidate();
      void router.push("/");
    },
  });

  // const { showImportFileBrowser } = useContext(AppContext);
  // useEffect(() => {
  //   if (showImportFileBrowser) {
  //     triggerFileBrowse();
  //   }
  // }, [showImportFileBrowser]);
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
    const fr = new FileReader();
    fr.onload = convertFileToDataUrl;
    fr.readAsDataURL(file);
  };

  const convertFileToDataUrl = (e: ProgressEvent<FileReader>) => {
    const dataUrlString = e.target?.result;
    if (dataUrlString) {
      importMeasurables({
        dataUrl: dataUrlString as string,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-lg" className="rounded-full">
          <span>PMW</span>
          {/* <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" /> */}
          {/* <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" /> */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => exportMeasurables()}
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
