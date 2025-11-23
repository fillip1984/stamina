import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { SlideInLeft } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
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

import { MeasurableType } from "@stamina/api";
import { calculateMeasurableProgress } from "@stamina/api/client";

import Button from "~/components/ui/button";
import Container from "~/components/ui/container";
import {
  default as CustomText,
  default as Typography,
} from "~/components/ui/typography";
import { trpc } from "~/utils/api";

export default function Main() {
  const [selectedDateFilter, setSelectedDateFilter] = useState("Today");

  // const { data, error, isPending } = authClient.useSession();
  const measurables = useQuery(trpc.measurable.findAll.queryOptions());
  const [filteredMeasurables, setFilteredMeasurables] = useState<
    MeasurableType[]
  >([]);
  useEffect(() => {
    if (!measurables.data) return;
    let filtered = measurables.data;

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
      filtered = measurables.data;
    }
    setFilteredMeasurables(filtered);
  }, [measurables.data, selectedDateFilter]);

  return (
    <Container className="relative">
      {/* <View className="flex items-center justify-center">
        <CustomText>Main</CustomText>
        <Text className="bg-amber-400">
          {isPending ? "Loading..." : "Loaded"}
        </Text>
        <Text className="bg-amber-400">
          {error ? error.message : "No errors"}
        </Text>
        <Text className="bg-amber-400">
          {data?.user.name ?? "Not logged in"}
        </Text>
        <Button onPress={() => authClient.signOut()}>
          <Text>Sign out</Text>
        </Button>
        <Button
          variant={"destructive"}
          size={"lg"}
          onPress={() => authClient.signOut()}
        >
          <Text>Sign out</Text>
        </Button>
        <TouchableOpacity onPress={() => authClient.signOut()}>
          <Text>Sign out</Text>
        </TouchableOpacity>
      </View> */}
      <View className="flex flex-row items-center justify-between">
        <Button variant={"outline"} className="h-14 w-14 rounded-full">
          <MaterialCommunityIcons
            name="palette-swatch-outline"
            size={20}
            color="white"
          />
        </Button>
        <Button variant={"outline"} className="h-14 w-14 rounded-full">
          <Ionicons name="trophy-outline" size={18} color="white" />
        </Button>
      </View>
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
    <View className="my-8 flex flex-row justify-center gap-2">
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

const MeasureableCard = ({ measurable }: { measurable: MeasurableType }) => {
  const { daysRemaining, elapsedDays, overdue, progress } =
    calculateMeasurableProgress(
      measurable.setDate,
      measurable.dueDate ?? undefined,
    );
  return (
    <View className="rounded-2xl border border-white p-2">
      <CustomText className="text-xl font-bold">{measurable.name}</CustomText>
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
