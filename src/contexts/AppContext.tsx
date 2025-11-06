"use client";

import { createContext, useEffect, useState } from "react";

type AppContextType = {
  isCreateMeasurableModalOpen: boolean;
  openCreateMeasurableModal: () => void;
  closeCreateMeasurableModal: () => void;
  measurableIdToEdit: string;
  setMeasurableIdToEdit: (id: string) => void;
  // isShowImportFileBrowser: boolean;
  // showImportFileBrowser?: () => void;
};

export const AppContext = createContext<AppContextType>({
  isCreateMeasurableModalOpen: false,
  openCreateMeasurableModal: () => {},
  closeCreateMeasurableModal: () => {},
  measurableIdToEdit: "",
  setMeasurableIdToEdit: () => {},
  // isShowImportFileBrowser: false,
  // showImportFileBrowser: () => {},
});

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCreateMeasurableModalOpen, setIsCreateMeasurableModalOpen] =
    useState(false);
  const [measurableIdToEdit, setMeasurableIdToEdit] = useState<string>("");
  useEffect(() => {
    if (measurableIdToEdit !== "") {
      setIsCreateMeasurableModalOpen(true);
    }
  }, [measurableIdToEdit]);
  // const [isShowImportFileBrowser, setIsShowImportFileBrowser] = useState(false);

  return (
    <AppContext.Provider
      value={{
        isCreateMeasurableModalOpen,
        openCreateMeasurableModal: () => setIsCreateMeasurableModalOpen(true),
        closeCreateMeasurableModal: () => {
          setIsCreateMeasurableModalOpen(false);
          setMeasurableIdToEdit("");
        },
        measurableIdToEdit,
        setMeasurableIdToEdit,
        // isShowImportFileBrowser,
        // showImportFileBrowser: () => setIsShowImportFileBrowser(true),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
