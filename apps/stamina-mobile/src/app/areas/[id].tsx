import React, { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMutation, useQuery } from "@tanstack/react-query";

import Button from "~/components/ui/button";
import Container from "~/components/ui/container";
import { queryClient, trpc } from "~/utils/api";

export default function AreaDetailPage() {
  // form state
  const [mode, setMode] = useState<"Create" | "Update">("Create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // IX: init form state
  const { id } = useLocalSearchParams<{ id: string }>();
  const area = useQuery(
    trpc.area.findById.queryOptions({ id }, { enabled: !!id }),
  );
  useEffect(() => {
    if (area.data) {
      setMode("Update");
      setName(area.data.name);
      setDescription(area.data.description);
    }
  }, [area.data]);

  // UX: form validation
  const [isValid, setIsValid] = useState(false);
  const validateForm = () => {
    if (name.trim() === "") return false;
    if (description.trim() === "") return false;
    return true;
  };
  useEffect(() => {
    setIsValid(validateForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, description]);

  // MX: create/update area
  const updateArea = useMutation(
    trpc.area.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.area.findAll.queryFilter());
        router.dismiss();
      },
    }),
  );
  const createArea = useMutation(
    trpc.area.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.area.findAll.queryFilter());
        router.dismiss();
      },
    }),
  );

  const handleSubmit = async () => {
    if (!isValid) return;

    if (mode === "Update") {
      await updateArea.mutateAsync({
        id,
        name: name.trim(),
        description: description.trim(),
      });
    } else {
      await createArea.mutateAsync({
        name: name.trim(),
        description: description.trim(),
      });
    }
  };

  return (
    <Container className="flex h-full bg-zinc-700">
      <View className="flex flex-row justify-between bg-zinc-700 p-4">
        <Button
          onPress={() => router.dismiss()}
          variant={"outline"}
          className="rounded-full"
        >
          <MaterialCommunityIcons name="close-thick" size={20} color="white" />
        </Button>
        <Button
          onPress={handleSubmit}
          variant={"outline"}
          className="rounded-full"
        >
          <MaterialCommunityIcons name="check" size={20} color="white" />
        </Button>
      </View>
      <View className="flex h-full gap-2 bg-zinc-700">
        <TextInput
          value={name}
          onChangeText={setName}
          className="rounded-lg border border-white p-2 text-xl text-white"
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          className="rounded-lg border border-white p-2 text-lg text-white"
        />
      </View>
    </Container>
  );
}
