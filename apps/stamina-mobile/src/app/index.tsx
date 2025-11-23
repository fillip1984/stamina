import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { SlideInLeft } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";
import {
  endOfWeek,
  format,
  interval,
  isEqual,
  isPast,
  isToday,
  isWithinInterval,
  startOfWeek,
} from "date-fns";

import { AreaType, MeasurableType } from "@stamina/api";
import { calculateMeasurableProgress } from "@stamina/api/client";

import Badge from "~/components/ui/badge";
import Button from "~/components/ui/button";
import Container from "~/components/ui/container";
import {
  default as CustomText,
  default as Typography,
} from "~/components/ui/typography";
import { AppContext } from "~/contexts/AppContext";
import { trpc } from "~/utils/api";

export const AllAreas: AreaType = {
  id: "All",
  name: "All",
  description: "All areas",
};

export default function Main() {
  const [selectedDateFilter, setSelectedDateFilter] = useState("Today");

  const areas = useQuery(trpc.area.findAll.queryOptions());
  const { areaFilter } = useContext(AppContext);

  // const { data, error, isPending } = authClient.useSession();
  const measurables = useQuery(
    trpc.measurable.findAll.queryOptions(undefined, {
      enabled: !areas.isLoading,
      select: (data) =>
        data.map((measurable) => ({
          ...measurable,
          areaName:
            areas.data?.find((area) => area.id === measurable.areaId)?.name ??
            "Uncategorized",
        })),
    }),
  );
  const [filteredMeasurables, setFilteredMeasurables] = useState<
    (MeasurableType & { areaName: string })[]
  >([]);
  useEffect(() => {
    if (!measurables.data) return;
    const measurablesFilteredByArea = measurables.data.filter((measurable) => {
      // Uncategorized -> areaId is null
      if (areaFilter === null) {
        return !measurable.areaId;
      }
      // All -> return all
      if (areaFilter.id === "All") {
        return true;
      }
      // Specific area -> areaId matches
      return measurable.areaId === areaFilter.id;
    });
    let filtered = measurablesFilteredByArea;

    const now = new Date();
    if (selectedDateFilter === "Today") {
      filtered = filtered.filter(
        (m) => !m.dueDate || isPast(m.dueDate) || isToday(m.dueDate),
      );
    } else if (selectedDateFilter === "Tomorrow") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(
        (m) => !m.dueDate || isPast(m.dueDate) || isEqual(m.dueDate, tomorrow),
      );
    } else if (selectedDateFilter === "This week") {
      const thisWeek = interval(startOfWeek(now), endOfWeek(now));
      filtered = filtered.filter(
        (m) =>
          !m.dueDate ||
          isPast(m.dueDate) ||
          isWithinInterval(m.dueDate, thisWeek),
      );
    } else if (selectedDateFilter === "All") {
      // no additional filtering
    }
    setFilteredMeasurables(filtered);
  }, [areaFilter, measurables.data, selectedDateFilter]);

  return (
    <Container className="relative">
      <Filters
        selectedDateFilter={selectedDateFilter}
        setSelectedDateFilter={setSelectedDateFilter}
      />
      <View className="flex gap-2">
        {filteredMeasurables.map((measurable) => (
          <MeasureableCard key={measurable.id} measurable={measurable} />
        ))}
      </View>

      {/* fabs */}
      <Button
        className="absolute right-4 bottom-4 h-12 w-12 rounded-full"
        onPress={() => {}}
      >
        <FontAwesome name="plus" size={18} color="black" />
      </Button>
    </Container>
  );
}

const Filters = ({
  selectedDateFilter,
  setSelectedDateFilter,
}: {
  selectedDateFilter: string;
  setSelectedDateFilter: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const dateFilters = ["Today", "Tomorrow", "This week", "All"];
  return (
    <View className="mt-2 mb-4 flex flex-row justify-center gap-2">
      {dateFilters.map((filter) => (
        <Button
          key={filter}
          variant={selectedDateFilter === filter ? "default" : "outline"}
          onPress={() => setSelectedDateFilter(filter)}
        >
          <Typography
            className={`${selectedDateFilter === filter ? "text-black" : "text-white"}`}
          >
            {filter}
          </Typography>
        </Button>
      ))}
    </View>
  );
};

const MeasureableCard = ({
  measurable,
}: {
  measurable: MeasurableType & { areaName: string };
}) => {
  const { daysRemaining, elapsedDays, overdue, progress } =
    calculateMeasurableProgress(
      measurable.setDate,
      measurable.dueDate ?? undefined,
    );
  return (
    <View className="rounded-2xl border border-white p-2">
      <View className="flex flex-row items-center gap-1">
        <CustomText className="text-xl font-bold">{measurable.name}</CustomText>
        <Badge variant={"outline"}>
          <Typography>{measurable.areaName}</Typography>
        </Badge>
      </View>
      <CustomText className="text-sm text-gray-400">
        {measurable.description}
      </CustomText>

      <View className="relative my-2 flex flex-row items-center justify-center overflow-hidden rounded-3xl border border-white py-1">
        {/* render prgress label for count down mode */}
        {measurable.dueDate && (
          <View className="z-30 flex flex-row items-center">
            <Typography className="mr-2 text-2xl font-bold">
              {daysRemaining > 0 ? daysRemaining : daysRemaining * -1}
            </Typography>
            <Typography>days {overdue ? "overdue" : "remaining"}</Typography>
            <View className="ml-4 flex flex-row items-center gap-1">
              <MaterialCommunityIcons
                name="bullseye-arrow"
                size={24}
                color="white"
              />
              <Typography>{format(measurable.dueDate, "MMM do")}</Typography>
            </View>
          </View>
        )}

        {/* render prgress label for tally and seeking modes */}
        {(measurable.type === "Tally" || measurable.type === "Seeking") && (
          <View className="z-30 flex flex-row items-center">
            <Typography className="mr-2 text-2xl font-bold">
              {elapsedDays > 0 ? elapsedDays : 0}
            </Typography>
            {measurable.type === "Tally" ? (
              <Typography className="text-xs">days and counting</Typography>
            ) : (
              <Typography className="text-xs">days since</Typography>
            )}
          </View>
        )}

        {/* progress bar fill animations */}
        <Animated.View
          entering={SlideInLeft.duration(800).delay(100).springify()}
          style={{
            width: `${progress > 100 ? 100 : progress}%`,
            backgroundColor: "rgba(37, 99, 235, 1)",
            position: "absolute",
            inset: 0,
            zIndex: 10,
          }}
        ></Animated.View>

        {overdue && (
          <Animated.View
            entering={SlideInLeft.duration(800).delay(200)}
            style={{
              width: `${progress * 0.1}%`,
              backgroundColor: "rgba(220, 38, 38, 1)",
              position: "absolute",
              inset: 0,
              zIndex: 20,
            }}
            className="absolute inset-0 z-20 bg-red-600/80"
          ></Animated.View>
        )}
      </View>
    </View>
  );
};
