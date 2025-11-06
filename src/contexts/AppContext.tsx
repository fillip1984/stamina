"use client";

import { createContext, useState } from "react";

type AppContextType = {
  isCreateMeasurableModalOpen: boolean;
  openCreateMeasurableModal: () => void;
  closeCreateMeasurableModal: () => void;
};

export const AppContext = createContext<AppContextType>({
  isCreateMeasurableModalOpen: false,
  openCreateMeasurableModal: () => {},
  closeCreateMeasurableModal: () => {},
});

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCreateMeasurableModalOpen, setIsCreateMeasurableModalOpen] =
    useState(false);
  return (
    <AppContext.Provider
      value={{
        isCreateMeasurableModalOpen,
        openCreateMeasurableModal: () => setIsCreateMeasurableModalOpen(true),
        closeCreateMeasurableModal: () => setIsCreateMeasurableModalOpen(false),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
