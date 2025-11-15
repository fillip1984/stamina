"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { FiDownloadCloud, FiUploadCloud } from "react-icons/fi";
import { IoScaleOutline } from "react-icons/io5";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import Header from "~/components/ui/my-ui/header";
import ScrollableContainer from "~/components/ui/my-ui/scrollableContainer";
import { api } from "~/trpc/react";
import type { AreaType, MeasurableType } from "~/trpc/types";

export default function PreferencesPage() {
  return (
    <ScrollableContainer scrollToTopButton={true}>
      <Header>
        <h4>Settings</h4>
      </Header>

      <div className="flex w-full flex-col gap-4">
        <ImportExportSection />
        <WeightGoalsSection />
      </div>
    </ScrollableContainer>
  );
}

const ImportExportSection = () => {
  const router = useRouter();

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
    <div className="flex w-full flex-col gap-2">
      <h5>Import/Export</h5>
      <p>Manage your data import and export settings.</p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={triggerFileBrowse}>
          Import Data <FiUploadCloud />
        </Button>
        <Button variant="outline" onClick={() => exportData()}>
          Export Data <FiDownloadCloud />
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        multiple={true}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

const WeightGoalsSection = () => {
  const [weightGoal, setWeightGoal] = useState("");
  const utils = api.useUtils();
  const { data: existingWeightGoal } = api.weighIn.getWeightGoal.useQuery();
  useEffect(() => {
    if (existingWeightGoal?.weight) {
      setWeightGoal(existingWeightGoal.weight.toString());
    }
  }, [existingWeightGoal]);
  const { mutate: setWeightGoalMutate } = api.weighIn.setWeightGoal.useMutation(
    {
      onSuccess: () => {
        void utils.weighIn.invalidate();
      },
    },
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <h5>Weight Goals</h5>
      <p>Set and track your weight goals.</p>
      <InputGroup className="w-40">
        <InputGroupAddon>
          <IoScaleOutline />
        </InputGroupAddon>
        <InputGroupInput
          value={weightGoal}
          onChange={(e) => setWeightGoal(e.target.value)}
          placeholder="180.2"
          onBlur={() => {
            if (weightGoal.trim() === "") {
              setWeightGoalMutate({ weightGoal: null });
            } else {
              const weight = parseFloat(weightGoal);
              if (!isNaN(weight)) {
                setWeightGoalMutate({ weightGoal: weight });
              }
            }
          }}
        />
        <InputGroupAddon align="inline-end">lbs</InputGroupAddon>
      </InputGroup>
    </div>
  );
};
