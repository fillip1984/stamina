import React, { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import { trpc } from "~/utils/api";

export default function SettingsPage() {
  const [weightGoal, setWeightGoal] = useState("");
  const weightGoalInputRef = useRef<TextInput>(null);

  const { data: existingWeightGoal } = useQuery(
    trpc.weighIn.getWeightGoal.queryOptions(),
  );
  useEffect(() => {
    if (existingWeightGoal?.weight) {
      setWeightGoal(existingWeightGoal.weight.toString());
    }
  }, [existingWeightGoal]);

  const queryClient = useQueryClient();
  const setWeightGoalMutation = useMutation(
    trpc.weighIn.setWeightGoal.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.weighIn.getWeightGoal.queryFilter());
        queryClient.invalidateQueries(trpc.result.findAll.queryFilter());
      },
    }),
  );

  return (
    <Container variant={"sheet"} className="px-2 pt-8">
      <Typography variant={"heading"} size={"title"}>
        Settings
      </Typography>
      <View className="mt-8">
        <Typography variant={"heading"} size={"heading"}>
          Weight Goal
        </Typography>
        <Pressable
          onPress={() => weightGoalInputRef.current?.focus()}
          className="w-36 flex-row items-center gap-2 rounded-md bg-zinc-900 px-2 py-1"
        >
          <Ionicons name="scale-outline" size={24} color="gray" />
          <TextInput
            value={weightGoal}
            onChangeText={setWeightGoal}
            onBlur={() => {
              if (weightGoal.trim() === "") {
                setWeightGoalMutation.mutateAsync({ weightGoal: null });
              } else {
                const weight = parseFloat(weightGoal);
                if (!isNaN(weight)) {
                  setWeightGoalMutation.mutateAsync({ weightGoal: weight });
                }
              }
            }}
            keyboardType="decimal-pad"
            className="flex w-16 text-xl text-white"
            ref={weightGoalInputRef}
          />
          <Typography variant={"muted"}>lbs</Typography>
        </Pressable>
      </View>
    </Container>
  );
}
