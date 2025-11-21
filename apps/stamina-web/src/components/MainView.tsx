"use client";

import { useContext, useEffect, useState } from "react";
import { isToday } from "date-fns/isToday";
import { AnimatePresence, motion } from "motion/react";
import { GiStoneStack } from "react-icons/gi";

import type { MeasurableType } from "@stamina/api";

import { AppContext } from "~/contexts/AppContext";
import { api } from "~/trpc/react";
import MeasureableCard from "./measurable/measurableCard";
import { Button } from "./ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import LoadingAndRetry from "./ui/my-ui/loadingAndRetry";
import ScrollableContainer from "./ui/my-ui/scrollableContainer";

export default function Home() {
  const { areaFilter } = useContext(AppContext);
  const { data: areas, isLoading: isLoadingAreas } =
    api.area.findAll.useQuery();
  const {
    data: measurables,
    isLoading: isLoadingMeasurables,
    isError,
    refetch,
  } = api.measurable.findAll.useQuery(undefined, {
    enabled: !isLoadingAreas,
    select: (data) =>
      data.map((measurable) => ({
        ...measurable,
        areaName:
          areas?.find((area) => area.id === measurable.areaId)?.name ??
          "Uncategorized",
      })),
  });

  const [filteredMeasurables, setFilteredMeasurables] = useState<
    (MeasurableType & { areaName: string })[]
  >([]);
  const [selectedFilter, setSelectedFilter] = useState("Today");

  useEffect(() => {
    if (!measurables) return;
    const measurablesFilteredByArea = measurables.filter((measurable) => {
      // All -> return all
      // Uncategorized -> areaId is null
      // Specific area -> areaId matches
      if (areaFilter === null) {
        return !measurable.areaId;
      } else if (areaFilter.id === "All") {
        return true;
      } else {
        return measurable.areaId === areaFilter.id;
      }
    });
    if (selectedFilter === "All") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredMeasurables(measurablesFilteredByArea);
      return;
    } else if (selectedFilter === "Today") {
      setFilteredMeasurables(
        measurablesFilteredByArea.filter(
          (measurable) => !measurable.dueDate || isToday(measurable.dueDate),
        ),
      );
    } else if (selectedFilter === "Tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFilteredMeasurables(
        measurablesFilteredByArea.filter(
          (measurable) =>
            !measurable.dueDate ||
            (measurable.dueDate.getDate() === tomorrow.getDate() &&
              measurable.dueDate.getMonth() === tomorrow.getMonth() &&
              measurable.dueDate.getFullYear() === tomorrow.getFullYear()),
        ),
      );
    } else if (selectedFilter === "This week") {
      const now = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      setFilteredMeasurables(
        measurablesFilteredByArea.filter(
          (measurable) =>
            !measurable.dueDate ||
            (measurable.dueDate >= now && measurable.dueDate <= endOfWeek),
        ),
      );
    }
  }, [measurables, selectedFilter, areaFilter]);

  if (isLoadingMeasurables || isLoadingAreas || isError) {
    return (
      <LoadingAndRetry
        isLoading={isLoadingMeasurables || isLoadingAreas}
        isError={isError}
        retry={() => void refetch()}
      />
    );
  }

  return (
    <ScrollableContainer scrollToTopButton={true}>
      {/* TODO: maybe: https://theodorusclarence.com/blog/list-animation */}
      {
        <>
          <div className="mx-2 my-4 flex gap-2">
            <Button
              variant={selectedFilter === "Today" ? "default" : "outline"}
              onClick={() => setSelectedFilter("Today")}
            >
              Today
            </Button>
            <Button
              variant={selectedFilter === "Tomorrow" ? "default" : "outline"}
              onClick={() => setSelectedFilter("Tomorrow")}
            >
              Tomorrow
            </Button>
            <Button
              variant={selectedFilter === "This week" ? "default" : "outline"}
              onClick={() => setSelectedFilter("This week")}
            >
              This week
            </Button>
            <Button
              variant={selectedFilter === "All" ? "default" : "outline"}
              onClick={() => setSelectedFilter("All")}
            >
              All
            </Button>
          </div>

          <div className="flex w-full flex-col gap-2">
            <AnimatePresence>
              {filteredMeasurables.map((measurable) => (
                <motion.div
                  key={measurable.id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    delayChildren: 0.2,
                  }}
                >
                  <MeasureableCard measurable={measurable} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      }
      {measurables?.length === 0 && <EmptyView />}
    </ScrollableContainer>
  );
}

const EmptyView = () => {
  const { openCreateMeasurableModal } = useContext(AppContext);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GiStoneStack />
        </EmptyMedia>
        <EmptyTitle>Nothing to show yet</EmptyTitle>
        <EmptyDescription>
          Try clicking some of the buttons to get started...
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={openCreateMeasurableModal}>Create</Button>
          {/* <Button variant="outline" onClick={showImportFileBrowser}>
            Import
          </Button> */}
        </div>
      </EmptyContent>
    </Empty>
  );
};
