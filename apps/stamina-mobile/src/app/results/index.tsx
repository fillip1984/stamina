import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";

import type {
  BloodPressureReadingType,
  ResultType,
  WeighInType,
} from "@stamina/api";

import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import { trpc } from "~/utils/api";

export default function ResultsPage() {
  const results = useQuery(trpc.result.findAll.queryOptions());
  return (
    <Container className="">
      <ScrollView>
        {results.data?.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </ScrollView>
    </Container>
  );
}

const ResultCard = ({ result }: { result: ResultType }) => {
  return (
    <View className="mb-4 flex flex-row gap-2 rounded-lg border border-white p-2">
      {/* result card header */}
      <View className="flex items-center justify-center gap-2">
        {result.bloodPressureReading ? (
          <FontAwesome name="heartbeat" size={36} color="white" />
        ) : result.weighIn ? (
          <Ionicons name="scale-outline" size={36} color="white" />
        ) : (
          <Ionicons name="trophy-outline" size={36} color="white" />
        )}
        <View className="flex flex-row items-center justify-center gap-1">
          <Ionicons name="calendar-outline" size={16} color="gray" />
          <Typography variant={"muted"} className="text-sm">
            {result.date.toLocaleDateString()}
          </Typography>
        </View>
      </View>

      {/* result card contents */}
      <View className="flex grow flex-row items-center justify-center">
        {result.bloodPressureReading ? (
          <BloodPressureResult
            bloodPressureReading={result.bloodPressureReading}
          />
        ) : result.weighIn ? (
          <WeighInResult weighIn={result.weighIn} />
        ) : (
          <NotesOnlyResult result={result} />
        )}
      </View>
    </View>
  );
};

const WeighInResult = ({ weighIn }: { weighIn: WeighInType }) => {
  const { data: weightGoal } = useQuery(
    trpc.weighIn.getWeightGoal.queryOptions(),
  );
  const { data: lastWeighIn } = useQuery(
    trpc.weighIn.readById.queryOptions(
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: weighIn.previousWeighInId!,
      },
      {
        enabled: !!weighIn.previousWeighInId,
      },
    ),
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
    <View className="flex w-3/4 gap-1">
      <View className="flex flex-row gap-3">
        <StatCard
          title={
            <>
              <Ionicons name="scale-outline" size={24} color="white" />
              weight
            </>
          }
          primaryValue={weighIn.weight}
          primaryFooter="lbs"
          trendValue={weightTrendValue ?? undefined}
          trendFooter={
            weightTrendValue === null ? undefined : weightTrendValue === 0 ? (
              <FontAwesome name="arrow-right" size={24} color="white" />
            ) : weightTrendValue > 0 ? (
              <FontAwesome name="arrow-up" size={24} color="white" />
            ) : (
              <FontAwesome name="arrow-down" size={24} color="white" />
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
              <FontAwesome6 name="person" size={24} color="white" />
              body fat
            </>
          }
          primaryValue={weighIn.bodyFatPercentage ?? ""}
          primaryFooter="%"
          trendValue={bodyFatTrendValue ?? undefined}
          trendFooter={
            bodyFatTrendValue === null ? undefined : bodyFatTrendValue === 0 ? (
              <FontAwesome name="arrow-right" size={24} color="white" />
            ) : bodyFatTrendValue > 0 ? (
              <FontAwesome name="arrow-up" size={24} color="white" />
            ) : (
              <FontAwesome name="arrow-down" size={24} color="white" />
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
      </View>
      {weightGoal?.weight && (
        <StatCard
          title={
            <>
              <MaterialCommunityIcons
                name="bullseye-arrow"
                size={24}
                color="yellow"
              />
              Goal
              <Typography className="text-sm lowercase">
                {weightGoal.weight} lbs
              </Typography>
            </>
          }
          primaryValue={
            weightGoal.weight
              ? (weighIn.weight - weightGoal.weight).toFixed(2)
              : "N/A"
          }
          primaryFooter="lbs to go"
        />
      )}
    </View>
  );
};

const BloodPressureResult = ({
  bloodPressureReading,
}: {
  bloodPressureReading: BloodPressureReadingType;
}) => {
  const { data: lastBloodPressureReading } = useQuery(
    trpc.bloodPressureReading.readById.queryOptions(
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: bloodPressureReading.previousBloodPressureReadingId!,
      },
      {
        enabled: !!bloodPressureReading.previousBloodPressureReadingId,
      },
    ),
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
    <View className="flex w-3/4 gap-1">
      <View className="flex flex-row gap-3">
        <StatCard
          title={
            <>
              <FontAwesome6 name="heart-pulse" size={24} color="red" />
              systolic
            </>
          }
          primaryValue={bloodPressureReading.systolic}
          primaryFooter="mmHg"
          trendValue={systolicTrendValue ?? undefined}
          trendFooter={
            systolicTrendValue === null ? undefined : systolicTrendValue ===
              0 ? (
              <FontAwesome name="arrow-right" size={24} color="white" />
            ) : systolicTrendValue > 0 ? (
              <FontAwesome name="arrow-up" size={24} color="white" />
            ) : (
              <FontAwesome name="arrow-down" size={24} color="white" />
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
              <FontAwesome name="heart" size={24} color="red" />
              diastolic
            </>
          }
          primaryValue={bloodPressureReading.diastolic}
          primaryFooter="mmHg"
          trendValue={diastolicTrendValue ?? undefined}
          trendFooter={
            <FontAwesome name="arrow-down" size={24} color="white" />
          }
          trendDirection="down"
        />
      </View>
      <View className="flex flex-row gap-3">
        <StatCard
          title={
            <>
              <FontAwesome6 name="heart-pulse" size={24} color="red" />
              pulse
            </>
          }
          primaryValue={bloodPressureReading.pulse ?? "N/A"}
          primaryFooter="bpm"
          trendValue={pulseTrendValue ?? undefined}
          trendFooter={
            <FontAwesome name="arrow-down" size={24} color="white" />
          }
          trendDirection="down"
        />

        <Pressable
          className="flex grow cursor-pointer"
          onPress={() =>
            Linking.openURL(
              "https://www.healthline.com/health/high-blood-pressure-hypertension/hypertension-related-conditions#Article-resources",
            )
          }
        >
          <StatCard
            title={
              <>
                <Ionicons name="medical-outline" size={24} color="red" />
                Category
              </>
            }
            // primaryValue={bloodPressureReading.category.replaceAll("_", " ")}
            primaryValue="HTN 2"
            primaryFooter="learn more"
          />
        </Pressable>
      </View>
    </View>
  );
};

const NotesOnlyResult = ({ result }: { result: ResultType }) => {
  return (
    <View className="flex grow justify-start">
      <Typography>{result.notes}</Typography>
    </View>
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
    <View className="flex grow flex-col rounded-lg border border-white/30 bg-zinc-900">
      <Typography className="flex flex-row items-center justify-center gap-2 rounded-t rounded-b-none border border-white p-1 uppercase">
        {title}
      </Typography>
      <View className="flex grow flex-row items-center gap-2 rounded-t-none rounded-b border border-white p-1">
        <View className="flex grow flex-col items-center justify-center">
          <Typography className="text-2xl font-bold">{primaryValue}</Typography>
          {primaryFooter && (
            <Typography className="text-sm text-gray-200">
              {primaryFooter}
            </Typography>
          )}
        </View>
        {trendValue !== undefined && (
          <>
            {/* <Separator orientation="vertical" /> */}
            <View className="h-full w-0.5 bg-white" />
            <View
              className={`flex w-12 flex-col items-center gap-1 p-1 ${trendDirection === "neutral" ? "text-gray-200" : trendDirection === "down" ? "text-green-400" : "text-destructive"}`}
            >
              <Typography>{trendValue}</Typography>
              {trendFooter}
            </View>
          </>
        )}
      </View>
    </View>
  );
};
