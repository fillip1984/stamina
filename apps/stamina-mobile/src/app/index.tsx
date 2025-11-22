import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { MeasurableType } from "@stamina/api";
import { calculateMeasurableProgress } from "@stamina/api/client";

import Button from "~/components/ui/button";
import Container from "~/components/ui/container";
import {
  default as CustomText,
  default as Typography,
} from "~/components/ui/typography";
import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

export default function Main() {
  const { data, error, isPending, refetch } = authClient.useSession();
  const measurables = useQuery(trpc.measurable.findAll.queryOptions());

  return (
    <Container>
      <View className="flex items-center justify-center">
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
      </View>
      <View className="flex gap-2">
        {measurables.data?.map((measurable) => (
          <MeasureableCard key={measurable.id} measurable={measurable} />
        ))}
      </View>
    </Container>
  );
}

const MeasureableCard = ({ measurable }: { measurable: MeasurableType }) => {
  const { daysRemaining, elapsedDays, interval, overdue, progress } =
    calculateMeasurableProgress(
      measurable.setDate,
      measurable.dueDate ?? undefined,
    );
  return (
    <View className="rounded border border-white p-2">
      <CustomText className="font-bold">{measurable.name}</CustomText>
      <CustomText className="text-gray-400">
        {measurable.description}
      </CustomText>

      {/* render prgress label for count down mode */}
      {measurable.dueDate && (
        <View className="relative my-2 flex flex-row items-center justify-center rounded-2xl border border-white py-1">
          <Typography className="px-2 text-2xl font-bold">
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
        <View className="absolute inset-0 z-30 flex items-center gap-1">
          <Typography className="text-xl font-bold">
            {elapsedDays > 0 ? elapsedDays : 0}
          </Typography>
          {measurable.type === "Tally" ? (
            <Typography className="text-xs">days and counting</Typography>
          ) : (
            <Typography className="text-xs">days since</Typography>
          )}
        </View>
      )}
    </View>
  );
};
