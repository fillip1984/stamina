"use client";

import { is } from "date-fns/locale";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import Header, { HeaderActions } from "~/components/my-ui/header";
import LoadingAndRetry from "~/components/my-ui/loadingAndRetry";
import ScrollableContainer from "~/components/my-ui/scrollableContainer";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function AreaPage() {
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);

  const utils = api.useUtils();
  const {
    data: areas,
    isLoading,
    isError,
    refetch,
  } = api.area.findAll.useQuery();

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
      <Header>
        <h4>Areas</h4>
        <HeaderActions>
          <Button onClick={() => setIsAddAreaModalOpen(true)} size={"icon"}>
            <FaPlus />
          </Button>
        </HeaderActions>
      </Header>

      <div className="flex flex-col gap-2">
        {areas?.map((area) => (
          <div key={area.id} className="rounded border p-2">
            {area.name}
          </div>
        ))}
      </div>
    </ScrollableContainer>
  );
}
