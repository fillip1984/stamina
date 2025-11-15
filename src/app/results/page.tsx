"use client";

import { Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsHeartPulseFill, BsJournalMedical } from "react-icons/bs";
import { FaArrowDown } from "react-icons/fa6";
import { IoMdCalendar } from "react-icons/io";
import { IoScaleOutline } from "react-icons/io5";
import { LuHeartPulse } from "react-icons/lu";
import { TbTargetArrow } from "react-icons/tb";
import { Item, ItemContent, ItemMedia } from "~/components/ui/item";
import Header from "~/components/ui/my-ui/header";
import LoadingAndRetry from "~/components/ui/my-ui/loadingAndRetry";
import ScrollableContainer from "~/components/ui/my-ui/scrollableContainer";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import type {
  BloodPressureReadingType,
  ResultType,
  WeighInType,
} from "~/trpc/types";

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

      <div className="flex w-full flex-col gap-2">
        {results?.map((result) => (
          <Item key={result.id} variant={"outline"} className="bg-card">
            <ItemMedia className="flex flex-col">
              {result.bloodPressureReading ? (
                <LuHeartPulse className="h-6 w-6" />
              ) : result.weighIn ? (
                <IoScaleOutline className="h-6 w-6" />
              ) : (
                <Trophy className="h-6 w-6" />
              )}
              <div className="text-muted-foreground flex items-center gap-1">
                <IoMdCalendar />
                {result.date.toLocaleDateString()}
              </div>
            </ItemMedia>
            <ItemContent className="h-full">
              {result.bloodPressureReading ? (
                <BloodPressureResult
                  bloodPressureReading={result.bloodPressureReading}
                />
              ) : result.weighIn ? (
                <WeighInResult weighIn={result.weighIn} />
              ) : (
                <NotesOnlyResult result={result} />
              )}
            </ItemContent>
          </Item>
        ))}
      </div>
    </ScrollableContainer>
  );
}

const WeighInResult = ({ weighIn }: { weighIn: WeighInType }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-flow-col">
      <StatCard
        title={
          <>
            <TbTargetArrow className="text-yellow-300" />
            Goal
          </>
        }
        primaryValue="32"
        primaryFooter="lbs to go"
        trendValue={""}
        trendFooter={""}
        trendDirection="neutral"
      />
      <StatCard
        title={
          <>
            <IoScaleOutline />
            weight
          </>
        }
        primaryValue={weighIn.weight}
        primaryFooter="lbs"
        trendValue={3.4}
        trendFooter={<FaArrowDown />}
        trendDirection="down"
      />
      <StatCard
        title={
          <>
            <IoScaleOutline />
            body fat
          </>
        }
        primaryValue={weighIn.bodyFatPercentage ?? "N/A"}
        primaryFooter="%"
        trendValue={0.8}
        trendFooter={<FaArrowDown className="text-xl" />}
        trendDirection="down"
      />
    </div>
  );
};

const BloodPressureResult = ({
  bloodPressureReading,
}: {
  bloodPressureReading: BloodPressureReadingType;
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-flow-col">
      <StatCard
        title={
          <>
            <AiOutlineHeart className="text-red-500" />
            systolic
          </>
        }
        primaryValue={bloodPressureReading.systolic}
        primaryFooter="mmHg"
        trendValue={10}
        trendFooter={<FaArrowDown className="text-xl" />}
        trendDirection="down"
      />
      <StatCard
        title={
          <>
            <AiFillHeart className="text-red-500" />
            diastolic
          </>
        }
        primaryValue={bloodPressureReading.diastolic}
        primaryFooter="mmHg"
        trendValue={5}
        trendFooter={<FaArrowDown className="text-xl" />}
        trendDirection="down"
      />
      <StatCard
        title={
          <>
            <BsHeartPulseFill className="text-red-500" />
            pulse
          </>
        }
        primaryValue={bloodPressureReading.pulse ?? "N/A"}
        primaryFooter="bpm"
        trendValue={10}
        trendFooter={<FaArrowDown className="text-xl" />}
        trendDirection="down"
      />

      <div
        className="flex grow cursor-pointer"
        onClick={() =>
          window.open(
            "https://www.healthline.com/health/high-blood-pressure-hypertension/hypertension-related-conditions#Article-resources",
          )
        }
      >
        <StatCard
          title={
            <>
              <BsJournalMedical className="text-red-500" />
              Category
            </>
          }
          // primaryValue={bloodPressureReading.category.replaceAll("_", " ")}
          primaryValue="HTN 2"
          primaryFooter="learn more"
        />
      </div>
    </div>
  );
};

const NotesOnlyResult = ({ result }: { result: ResultType }) => {
  return (
    <div className="flex h-full grow justify-start">
      <p>{result.notes}</p>
    </div>
  );
};

const StatCard = ({
  title,
  primaryValue,
  primaryFooter,
  trendValue,
  trendFooter,
  trendDirection,
}: {
  title: ReactNode;
  primaryValue: string | number;
  primaryFooter?: string;
  trendValue?: string | number;
  trendFooter?: ReactNode;
  trendDirection?: "up" | "down" | "neutral"; // assumes up is bad, down is good
}) => {
  return (
    <div className="flex grow flex-col">
      <div className="bg-accent flex items-center justify-center gap-1 rounded-t border p-1 uppercase">
        {title}
      </div>
      <div className="flex grow items-center gap-2 rounded-b border p-1">
        <div className="flex grow flex-col items-center justify-center">
          <span className="text-xl">{primaryValue}</span>
          {primaryFooter && (
            <span className="text-muted-foreground text-sm">
              {primaryFooter}
            </span>
          )}
        </div>
        {trendValue && (
          <>
            <Separator orientation="vertical" />
            <div
              className={`flex w-8 flex-col items-center gap-1 p-1 ${trendDirection === "neutral" ? "text-muted-foreground" : trendDirection === "down" ? "text-green-400" : "text-red-400"}`}
            >
              <span>{trendValue}</span>
              <span>{trendFooter}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
