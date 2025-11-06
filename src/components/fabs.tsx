"use client";

import React, { useContext } from "react";
import ThemeToggle from "./settingsFab";
import { Button } from "./ui/button";
import { FaPlus } from "react-icons/fa6";
import { AppContext } from "~/contexts/AppContext";

export default function Fabs() {
  const { isCreateMeasurableModalOpen, openCreateMeasurableModal } =
    useContext(AppContext);

  return (
    <div className="absolute right-4 bottom-6 flex flex-col gap-2">
      <ThemeToggle />
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
