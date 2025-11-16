"use client";

import { Trophy } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsHeartPulseFill, BsJournalMedical } from "react-icons/bs";
import { FaArrowDown, FaArrowRight, FaArrowUp } from "react-icons/fa6";
import { IoMdCalendar } from "react-icons/io";
import { IoScaleOutline } from "react-icons/io5";
import { LuHeartPulse } from "react-icons/lu";
import { PiPersonBold } from "react-icons/pi";
import { TbTargetArrow } from "react-icons/tb";
import {
  Item,
  ItemContent,
  ItemMedia,
} from "apps/stamina-web/src/components/ui/item";
import Header from "apps/stamina-web/src/components/ui/my-ui/header";
import LoadingAndRetry from "apps/stamina-web/src/components/ui/my-ui/loadingAndRetry";
import ScrollableContainer from "apps/stamina-web/src/components/ui/my-ui/scrollableContainer";
import { Separator } from "apps/stamina-web/src/components/ui/separator";
import { api } from "apps/stamina-web/src/trpc/react";
import type {
  BloodPressureReadingType,
  ResultType,
  WeighInType,
} from "apps/stamina-web/src/trpc/types";

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
  const { data: weightGoal } = api.weighIn.getWeightGoal.useQuery();
  const { data: lastWeighIn } = api.weighIn.readById.useQuery(
    {
      id: weighIn.previousWeighInId!,
    },
    {
      enabled: !!weighIn.previousWeighInId,
    },
  );
  const [weightTrendValue, setWeightTrendValue] = useState<number | null>(null);
  const [bodyFatTrendValue, setBodyFatTrendValue] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (lastWeighIn) {
      const weightDiff = (weighIn.weight - lastWeighIn.weight).toFixed(2);
      setWeightTrendValue(Number(weightDiff));

      if (weighIn.bodyFatPercentage && lastWeighIn.bodyFatPercentage) {
        const bodyFatDiff = (
          weighIn.bodyFatPercentage - lastWeighIn.bodyFatPercentage
        ).toFixed(2);
        setBodyFatTrendValue(Number(bodyFatDiff));
      }
    }
  }, [lastWeighIn, weighIn]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-flow-col">
      <StatCard
        title={
          <>
            <IoScaleOutline />
            weight
          </>
        }
        primaryValue={weighIn.weight}
        primaryFooter="lbs"
        trendValue={weightTrendValue ?? undefined}
        trendFooter={
          weightTrendValue === null ? undefined : weightTrendValue === 0 ? (
            <FaArrowRight />
          ) : weightTrendValue > 0 ? (
            <FaArrowUp />
          ) : (
            <FaArrowDown />
          )
        }
        trendDirection={
          weightTrendValue === null
            ? undefined
            : weightTrendValue === 0
              ? "neutral"
              : weightTrendValue > 0
                ? "up"
                : "down"
        }
      />
      <StatCard
        title={
          <>
            <PiPersonBold />
            body fat
          </>
        }
        primaryValue={weighIn.bodyFatPercentage ?? ""}
        primaryFooter="%"
        trendValue={bodyFatTrendValue ?? undefined}
        trendFooter={
          bodyFatTrendValue === null ? undefined : bodyFatTrendValue === 0 ? (
            <FaArrowRight />
          ) : bodyFatTrendValue > 0 ? (
            <FaArrowUp />
          ) : (
            <FaArrowDown />
          )
        }
        trendDirection={
          bodyFatTrendValue === null
            ? undefined
            : bodyFatTrendValue === 0
              ? "neutral"
              : bodyFatTrendValue > 0
                ? "up"
                : "down"
        }
      />
      {weightGoal?.weight && (
        <StatCard
          title={
            <>
              <TbTargetArrow className="text-yellow-300" />
              Goal
              <span className="text-sm lowercase">
                {weightGoal?.weight} lbs
              </span>
            </>
          }
          primaryValue={
            weightGoal?.weight
              ? (weighIn.weight - weightGoal.weight).toFixed(2)
              : "N/A"
          }
          primaryFooter="lbs to go"
        />
      )}
    </div>
  );
};

const BloodPressureResult = ({
  bloodPressureReading,
}: {
  bloodPressureReading: BloodPressureReadingType;
}) => {
  const { data: lastBloodPressureReading } =
    api.bloodPressureReading.readById.useQuery(
      {
        id: bloodPressureReading.previousBloodPressureReadingId!,
      },
      {
        enabled: !!bloodPressureReading.previousBloodPressureReadingId,
      },
    );
  const [systolicTrendValue, setSystolicTrendValue] = useState<number | null>(
    null,
  );
  const [diastolicTrendValue, setDiastolicTrendValue] = useState<number | null>(
    null,
  );
  const [pulseTrendValue, setPulseTrendValue] = useState<number | null>(null);
  useEffect(() => {
    if (lastBloodPressureReading) {
      const systolicDiff = (
        bloodPressureReading.systolic - lastBloodPressureReading.systolic
      ).toFixed(2);
      setSystolicTrendValue(Number(systolicDiff));

      const diastolicDiff = (
        bloodPressureReading.diastolic - lastBloodPressureReading.diastolic
      ).toFixed(2);
      setDiastolicTrendValue(Number(diastolicDiff));

      if (
        bloodPressureReading.pulse !== null &&
        lastBloodPressureReading.pulse !== null
      ) {
        const pulseDiff = (
          bloodPressureReading.pulse - lastBloodPressureReading.pulse
        ).toFixed(2);
        setPulseTrendValue(Number(pulseDiff));
      }
    }
  }, [bloodPressureReading, lastBloodPressureReading]);

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
        trendValue={systolicTrendValue ?? undefined}
        trendFooter={
          systolicTrendValue === null ? undefined : systolicTrendValue === 0 ? (
            <FaArrowRight />
          ) : systolicTrendValue > 0 ? (
            <FaArrowUp />
          ) : (
            <FaArrowDown />
          )
        }
        trendDirection={
          systolicTrendValue === null
            ? undefined
            : systolicTrendValue === 0
              ? "neutral"
              : systolicTrendValue > 0
                ? "up"
                : "down"
        }
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
        trendValue={diastolicTrendValue ?? undefined}
        trendFooter={<FaArrowDown />}
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
        trendValue={pulseTrendValue ?? undefined}
        trendFooter={<FaArrowDown />}
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
        {trendValue !== undefined && (
          <>
            <Separator orientation="vertical" />
            <div
              className={`flex w-8 flex-col items-center gap-1 p-1 ${trendDirection === "neutral" ? "text-muted-foreground" : trendDirection === "down" ? "text-green-400" : "text-destructive"}`}
            >
              <span>{trendValue}</span>
              {trendFooter}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
