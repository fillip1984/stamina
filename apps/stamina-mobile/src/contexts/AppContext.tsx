import { createContext, useState } from "react";

import type { AreaType } from "@stamina/api";

interface AppContextType {
  areaFilter: AreaType | null;
  setAreaFilter: (area: AreaType | null) => void;
  // isCreateMeasurableModalOpen: boolean;
  // openCreateMeasurableModal: () => void;
  // closeCreateMeasurableModal: () => void;
  // measurableIdToEdit: string;
  // setMeasurableIdToEdit: (id: string) => void;
  // isShowImportFileBrowser: boolean;
  // showImportFileBrowser?: () => void;
}

export const AllAreas: AreaType = {
  id: "All",
  name: "All",
  description: "All areas",
};
// export const UncategorizedArea: AreaType = {
//   id: "",
//   name: "Uncategorized",
//   description: "Uncategorized area",
// };
export const AppContext = createContext<AppContextType>({
  areaFilter: null,
  setAreaFilter: () => {
    /* empty */
  },
  // isCreateMeasurableModalOpen: false,
  // openCreateMeasurableModal: () => {
  /* empty */
  // },
  // closeCreateMeasurableModal: () => {
  /* empty */
  // },
  // measurableIdToEdit: "",
  // setMeasurableIdToEdit: () => {
  /* empty */
  // },
  // isShowImportFileBrowser: false,
  // showImportFileBrowser: () => {},
});

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [areaFilter, setAreaFilter] = useState<AreaType | null>(AllAreas);
  // const [isCreateMeasurableModalOpen, setIsCreateMeasurableModalOpen] =
  //   useState(false);
  // const [measurableIdToEdit, setMeasurableIdToEdit] = useState<string>("");
  // useEffect(() => {
  //   if (measurableIdToEdit !== "") {
  //     // eslint-disable-next-line react-hooks/set-state-in-effect
  //     setIsCreateMeasurableModalOpen(true);
  //   }
  // }, [measurableIdToEdit]);
  // const [isShowImportFileBrowser, setIsShowImportFileBrowser] = useState(false);

  return (
    <AppContext.Provider
      value={{
        areaFilter,
        setAreaFilter,
        // isCreateMeasurableModalOpen,
        // openCreateMeasurableModal: () => setIsCreateMeasurableModalOpen(true),
        // closeCreateMeasurableModal: () => {
        //   setIsCreateMeasurableModalOpen(false);
        //   setMeasurableIdToEdit("");
        // },
        // measurableIdToEdit,
        // setMeasurableIdToEdit,
        // isShowImportFileBrowser,
        // showImportFileBrowser: () => setIsShowImportFileBrowser(true),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
