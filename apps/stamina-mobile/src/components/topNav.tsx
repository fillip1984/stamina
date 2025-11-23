import React, { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import { AllAreas } from "~/app";
import { trpc } from "~/utils/api";
import Badge from "./ui/badge";
import Button from "./ui/button";
import Typography from "./ui/typography";

export default function TopNav({
  stackProps,
}: {
  stackProps: NativeStackHeaderProps;
}) {
  const areas = useQuery(trpc.area.findAll.queryOptions());
  const [areaFilter, setAreaFilter] = useState<null | {
    id: string;
    name: string;
  }>(AllAreas);

  console.log({ stackProps });
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top - 10,
        paddingBottom: insets.bottom - 30,
        backgroundColor: "#000",
      }}
      className="bg-sky-500"
    >
      <View className="flex flex-row items-center justify-between">
        <Button
          variant={"outline"}
          onPress={() => router.push("/areas")}
          className="h-14 w-14 rounded-full"
        >
          <MaterialCommunityIcons
            name="palette-swatch-outline"
            size={20}
            color="white"
          />
        </Button>
        <View className="mx-1 flex w-1/2 overflow-hidden">
          <View className="flex flex-row gap-2 overflow-auto">
            <Badge
              variant={areaFilter?.id === "All" ? "default" : "outline"}
              onPress={() => setAreaFilter(AllAreas)}
            >
              <Typography
                className={
                  areaFilter?.id === "All" ? "text-black" : "text-white"
                }
              >
                All
              </Typography>
            </Badge>
            {areas.data?.map((area) => (
              <Badge
                key={area.id}
                variant={areaFilter?.id === area.id ? "default" : "outline"}
                onPress={() => setAreaFilter(area)}
              >
                <Typography
                  className={
                    areaFilter?.id === area.id ? "text-black" : "text-white"
                  }
                >
                  {area.name}
                </Typography>
              </Badge>
            ))}
            <Badge
              variant={areaFilter === null ? "default" : "outline"}
              onPress={() => setAreaFilter(null)}
            >
              <Typography
                className={areaFilter === null ? "text-black" : "text-white"}
              >
                Uncategorized
              </Typography>
            </Badge>
          </View>
        </View>
        <Button variant={"outline"} className="h-14 w-14 rounded-full">
          <Ionicons name="trophy-outline" size={18} color="white" />
        </Button>
      </View>
    </View>
  );
}
