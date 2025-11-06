"use client";

import { useContext } from "react";
import { GiStoneStack } from "react-icons/gi";

import MeasureableCard from "~/components/measurableCard";
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

export default function Home() {
  const { data: measurables, isLoading } = api.measurable.findAll.useQuery();

  return (
    <div className="flex grow flex-col">
      <div className="flex grow flex-col gap-1 overflow-hidden overflow-y-auto pb-24">
        {isLoading && <Spinner className="mx-auto h-24 w-24" />}
        {!isLoading && measurables && measurables.length > 0 && (
          <div className="mx-auto flex grow flex-col gap-2">
            {measurables?.map((measurable) => (
              <MeasureableCard key={measurable.id} measurable={measurable} />
            ))}
          </div>
        )}
        {!isLoading && measurables && measurables.length === 0 && <EmptyView />}
      </div>
    </div>
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
