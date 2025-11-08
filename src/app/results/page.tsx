"use client";

import { Trophy } from "lucide-react";
import { FaFlagCheckered } from "react-icons/fa6";
import { GiCheckeredDiamond, GiCheckeredFlag } from "react-icons/gi";
import { IoMdCalendar } from "react-icons/io";
import { TbShieldCheckered, TbShieldCheckeredFilled } from "react-icons/tb";
import Header from "~/components/my-ui/header";
import LoadingAndRetry from "~/components/my-ui/loadingAndRetry";
import ScrollableContainer from "~/components/my-ui/scrollableContainer";
import { Item, ItemContent, ItemMedia } from "~/components/ui/item";
import { api } from "~/trpc/react";

export default function ResultsPage() {
  const {
    data: results,
    isLoading,
    isError,
    refetch,
  } = api.result.findAll.useQuery();

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
        <h4>Results</h4>
      </Header>

      <div className="flex flex-col gap-2">
        {results?.map((result) => (
          <Item key={result.id} variant={"outline"} className="bg-card">
            <ItemMedia>
              <Trophy />
            </ItemMedia>
            <ItemContent>
              <div>{result.notes}</div>
              <div className="text-muted-foreground flex items-center gap-1">
                <IoMdCalendar />
                {result.date.toLocaleDateString()}
              </div>
            </ItemContent>
            <GiCheckeredDiamond />
            <GiCheckeredFlag />
            <FaFlagCheckered />
            <TbShieldCheckered />
            <TbShieldCheckeredFilled />
          </Item>
        ))}
      </div>
    </ScrollableContainer>
  );
}
