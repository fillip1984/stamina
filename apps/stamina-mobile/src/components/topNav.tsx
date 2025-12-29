import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useContext } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";

import { AllAreas, AppContext } from "~/contexts/AppContext";
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
  const { areaFilter, setAreaFilter } = useContext(AppContext);

  // needed tighter control over padding, was leaving too much space underneath
  const insets = useSafeAreaInsets();

  if (stackProps.route.name.startsWith("areas/")) {
    return (
      <View
        style={{
          paddingTop: insets.top - 10,
          paddingBottom: insets.bottom - 20,
          paddingLeft: 10,
          paddingRight: 10,
          backgroundColor: "#000",
        }}
      >
        <Button
          variant={"outline"}
          onPress={() => router.back()}
          className="h-14 w-14 rounded-full"
        >
          <Ionicons name="chevron-back-outline" size={20} color="white" />
        </Button>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingTop: insets.top - 10,
        paddingBottom: insets.bottom - 20,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "#000",
      }}
      className="bg-sky-500"
    >
      <View className="flex flex-row items-center justify-between">
        {stackProps.route.name.startsWith("measurables/") ? (
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
        ) : (
          <Button
            variant={"outline"}
            onPress={() => router.back()}
            className="h-14 w-14 rounded-full"
          >
            <Ionicons name="chevron-back-outline" size={20} color="white" />
          </Button>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            alignItems: "center",
            paddingHorizontal: 2,
          }}
        >
          <Badge
            variant={areaFilter?.id === "All" ? "default" : "outline"}
            onPress={() => setAreaFilter(AllAreas)}
          >
            <Typography
              className={areaFilter?.id === "All" ? "text-black" : "text-white"}
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
        </ScrollView>

        {stackProps.route.name.startsWith("measurables/") && (
          <Button
            variant={"outline"}
            onPress={() => router.push("/results")}
            className="h-14 w-14 rounded-full"
          >
            <Ionicons name="trophy-outline" size={18} color="white" />
          </Button>
        )}

        {stackProps.route.name.startsWith("results/") && (
          <Button
            variant={"outline"}
            onPress={() => router.push("/settings")}
            className="h-14 w-14 rounded-full"
          >
            <Ionicons name="cog" size={20} color="white" />
          </Button>
        )}
      </View>
    </View>
  );
}
