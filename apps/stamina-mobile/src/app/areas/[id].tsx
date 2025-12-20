import React, { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMutation, useQuery } from "@tanstack/react-query";

import Button from "~/components/ui/button";
import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import { queryClient, trpc } from "~/utils/api";

export default function AreaDetailPage() {
  // form state
  const [mode, setMode] = useState<"Create" | "Update">("Create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // IX: init form state
  const nameInputRef = useRef<TextInput>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const area = useQuery(
    trpc.area.findById.queryOptions({ id }, { enabled: !!id && id !== "new" }),
  );
  useEffect(() => {
    if (area.data) {
      setMode("Update");
      setName(area.data.name);
      setDescription(area.data.description);
    } else {
      nameInputRef.current?.focus();
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

  const deleteArea = useMutation(
    trpc.area.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.area.findAll.queryFilter());
        router.dismiss();
      },
    }),
  );

  return (
    <Container variant={"sheet"}>
      <View className="flex-row justify-between px-4 py-2">
        <Button
          onPress={() => router.dismiss()}
          variant={"outline"}
          className="h-14 w-14 rounded-full"
        >
          <MaterialCommunityIcons name="close-thick" size={20} color="white" />
        </Button>
        <Button
          onPress={handleSubmit}
          variant={"outline"}
          className="h-14 w-14 rounded-full"
          disabled={!isValid}
        >
          <MaterialCommunityIcons name="check" size={20} color="white" />
        </Button>
      </View>
      <View className="m-4 flex gap-1 rounded-xl bg-white">
        <TextInput
          value={name}
          onChangeText={setName}
          ref={nameInputRef}
          placeholder="Area name..."
          className="rounded-lg border border-white px-2 text-xl"
        />
        <View className="mx-2 h-0.5 rounded-lg bg-gray-300" />
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          placeholder="Area description..."
          className="h-20 rounded-lg border border-white px-2 text-lg"
        />
      </View>
      {id !== "new" && (
        <View className="mt-4 flex items-center justify-center">
          <Button
            onPress={() => deleteArea.mutateAsync({ id })}
            variant="destructive"
            size={"lg"}
          >
            <Typography variant={"heading"}>Delete</Typography>
          </Button>
        </View>
      )}
    </Container>
  );
}
