import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

export default function SettingsPage() {
  // const { data, isPending } = authClient.useSession();
  // useEffect(() => {
  // if (!isPending && data?.user) {
  //   router.push("/measurables");
  // }
  // }, [data, isPending]);
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const [weightGoal, setWeightGoal] = useState("");
  const weightGoalInputRef = useRef<TextInput>(null);

  const { data: existingWeightGoal } = useQuery(
    trpc.weighIn.getWeightGoal.queryOptions(),
  );
  useEffect(() => {
    if (existingWeightGoal?.weight) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeightGoal(existingWeightGoal.weight.toString());
    }
  }, [existingWeightGoal]);

  const queryClient = useQueryClient();
  const setWeightGoalMutation = useMutation(
    trpc.weighIn.setWeightGoal.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.weighIn.getWeightGoal.queryFilter(),
        );
        void queryClient.invalidateQueries(trpc.result.findAll.queryFilter());
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
                void setWeightGoalMutation.mutateAsync({ weightGoal: null });
              } else {
                const weight = parseFloat(weightGoal);
                if (!isNaN(weight)) {
                  void setWeightGoalMutation.mutateAsync({
                    weightGoal: weight,
                  });
                }
              }
            }}
            keyboardType="decimal-pad"
            className="flex w-16 text-xl text-white"
            ref={weightGoalInputRef}
          />
          <Typography variant={"muted"}>lbs</Typography>
        </Pressable>
        <View className="flex items-center justify-center">
          <Pressable
            className="my-2 rounded-xl bg-sky-400 p-2"
            onPress={handleLogout}
          >
            <Text className="text-2xl text-white">Logout</Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
}
