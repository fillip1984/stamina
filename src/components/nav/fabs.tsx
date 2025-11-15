"use client";

import { useContext } from "react";

import { FaPlus } from "react-icons/fa6";
import { AppContext } from "~/contexts/AppContext";
import { Button } from "../ui/button";
import SettingsFab from "./settingsFab";

export default function Fabs() {
  const { isCreateMeasurableModalOpen, openCreateMeasurableModal } =
    useContext(AppContext);

  return (
    <div className="absolute right-4 bottom-6 flex flex-col gap-2">
      <SettingsFab />
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
