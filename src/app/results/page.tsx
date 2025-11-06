"use client";

import { Trophy } from "lucide-react";
import { FaFlagCheckered } from "react-icons/fa6";
import { GiCheckeredDiamond, GiCheckeredFlag } from "react-icons/gi";
import { IoMdCalendar } from "react-icons/io";
import { TbShieldCheckered, TbShieldCheckeredFilled } from "react-icons/tb";
import { Item, ItemContent, ItemMedia } from "~/components/ui/item";
import { api } from "~/trpc/react";

export default function ResultsPage() {
  const { data: results } = api.result.findAll.useQuery();
  return (
    <div className="flex grow flex-col gap-2 overflow-hidden">
      <h3>Results</h3>
      <div className="flex grow flex-col gap-2 overflow-y-auto p-4 pb-24">
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
    </div>
  );
}
