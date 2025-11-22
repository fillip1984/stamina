import { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Container({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={{ backgroundColor: "#000" }}>
      <View className="flex h-full">{children}</View>
    </SafeAreaView>
  );
}
