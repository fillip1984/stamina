import React from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";

import Button from "~/components/ui/button";
import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import { trpc } from "~/utils/api";
import { AreaType } from "../../../../../packages/api/dist/types";

export default function AreasPage() {
  const areas = useQuery(trpc.area.findAll.queryOptions());
  return (
    <Container className="relative">
      <View className="flex gap-2">
        {areas.data?.map((area) => (
          <AreaCard key={area.id} area={area} />
        ))}
      </View>
      <Button
        onPress={() =>
          router.push({ pathname: "/areas/[id]", params: { id: "new" } })
        }
        className="absolute right-4 bottom-40 h-14 w-14 rounded-full"
      >
        <FontAwesome name="plus" size={18} color="black" />
      </Button>
    </Container>
  );
}

const AreaCard = ({ area }: { area: AreaType }) => {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/areas/[id]", params: { id: area.id } })
      }
      className="rounded-lg border border-white p-2"
    >
      <Typography variant={"heading"}>{area.name}</Typography>
      <Typography variant={"muted"}>{area.description}</Typography>
    </Pressable>
  );
};
