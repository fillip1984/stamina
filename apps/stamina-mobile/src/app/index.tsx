import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "~/utils/auth";

export default function Main() {
  const { data, error, isPending, refetch } = authClient.useSession();

  return (
    <SafeAreaView>
      <View className="flex items-center justify-center">
        <Text className="bg-amber-400">Main</Text>
        <Text className="bg-amber-400">
          {isPending ? "Loading..." : "Loaded"}
        </Text>
        <Text className="bg-amber-400">
          {error ? error.message : "No errors"}
        </Text>
        <Text className="bg-amber-400">
          {data?.user.name ?? "Not logged in"}
        </Text>
        <TouchableOpacity onPress={() => authClient.signOut()}>
          <Text>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
