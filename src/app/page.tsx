"use client";

import { isToday } from "date-fns/isToday";
import { el } from "date-fns/locale";
import { Scroll } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useContext, useEffect, useState } from "react";
import { GiStoneStack } from "react-icons/gi";

import MeasureableCard from "~/components/measurableCard";
import LoadingAndRetry from "~/components/my-ui/loadingAndRetry";
import ScrollableContainer from "~/components/my-ui/scrollableContainer";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Spinner } from "~/components/ui/spinner";
import { AppContext } from "~/contexts/AppContext";

import { api } from "~/trpc/react";
import type { MeasurableType } from "~/trpc/types";

export default function Home() {
  const {
    data: measurables,
    isLoading,
    isError,
    refetch,
  } = api.measurable.findAll.useQuery();
  const [filteredMeasurables, setFilteredMeasurables] = useState<
    MeasurableType[]
  >([]);
  const [selectedFilter, setSelectedFilter] = useState("Today");

  useEffect(() => {
    if (!measurables) return;
    if (selectedFilter === "All") {
      setFilteredMeasurables(measurables);
      return;
    } else if (selectedFilter === "Today") {
      setFilteredMeasurables(
        measurables.filter(
          (measurable) => !measurable.dueDate || isToday(measurable.dueDate),
        ),
      );
    } else if (selectedFilter === "Tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFilteredMeasurables(
        measurables.filter(
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
        measurables.filter(
          (measurable) =>
            !measurable.dueDate ||
            (measurable.dueDate >= now && measurable.dueDate <= endOfWeek),
        ),
      );
    }
  }, [measurables, selectedFilter]);

  if (isLoading || isError) {
    return (
      <LoadingAndRetry
        isLoading={isLoading}
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

          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {filteredMeasurables?.map((measurable, i) => (
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
      {!isLoading && measurables && measurables.length === 0 && <EmptyView />}
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
