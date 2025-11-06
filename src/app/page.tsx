"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { GiStoneStack } from "react-icons/gi";
import CreateMeasurableDialog from "~/components/createMeasurableDialog";
import MeasureableCard from "~/components/measurableCard";
import ThemeToggle from "~/components/theme/themeToggle";
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
import { api } from "~/trpc/react";

export default function Home() {
  const utils = api.useUtils();
  const { data: measurables, isLoading } = api.measurable.findAll.useQuery();

  const [isCreatingMeasurableModalOpen, setIsCreatingMeasurableModalOpen] =
    useState(false);

  return (
    <div className="flex grow flex-col">
      <div className="flex justify-end gap-2 p-2">
        <ThemeToggle />
        <Button
          className="rounded-full"
          onClick={() => setIsCreatingMeasurableModalOpen(true)}
        >
          <FaPlus />
        </Button>
        <CreateMeasurableDialog
          isOpen={isCreatingMeasurableModalOpen}
          onClose={() => setIsCreatingMeasurableModalOpen(false)}
        />
      </div>
      <div className="flex grow flex-col gap-1 overflow-hidden overflow-y-auto pb-24">
        {isLoading && <Spinner className="mx-auto h-24 w-24" />}
        {!isLoading && measurables && measurables.length > 0 && (
          <div className="mx-auto flex grow flex-col gap-2">
            {measurables?.map((measurable) => (
              <MeasureableCard key={measurable.id} measurable={measurable} />
            ))}
          </div>
        )}
        {!isLoading && measurables && measurables.length === 0 && (
          <EmptyView
            setIsCreatingMeasurableModalOpen={setIsCreatingMeasurableModalOpen}
          />
        )}
      </div>
    </div>
  );
}

const EmptyView = ({
  setIsCreatingMeasurableModalOpen,
}: {
  setIsCreatingMeasurableModalOpen: (open: boolean) => void;
}) => {
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
          <Button onClick={() => setIsCreatingMeasurableModalOpen(true)}>
            Create
          </Button>
          <Button
            variant="outline"
            onClick={() => alert("Work in progress...")}
          >
            Import
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
};
