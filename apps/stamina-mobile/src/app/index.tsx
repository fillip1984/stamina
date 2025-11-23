import { useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

import Container from "~/components/ui/container";
// import { Colors } from "~/styles/colors";
import { authClient } from "~/utils/auth";

export default function SocialSignIn() {
  const { data, isPending } = authClient.useSession();
  useEffect(() => {
    if (!isPending && data?.user) {
      router.push("/measurables");
    }
  }, [data, isPending]);
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/", // this will be converted to a deep link (eg. `myapp://dashboard`) on native
    });
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <Container>
        {/* <View className="bg-background mt-8 flex h-screen items-center"> */}
        <Text className="text-3xl text-white">Welcome to Stamina</Text>
        <Text className="mb-12 text-sm text-white">
          This application is by invitation only...
        </Text>
        <TouchableOpacity
          onPress={handleLogin}
          className="flex flex-row items-center justify-center gap-8 rounded-lg border border-white p-6"
        >
          <AntDesign name="google" size={48} color={"white"} />
          <Text className="text-4xl font-bold text-white">Google</Text>
        </TouchableOpacity>
        {/* </View> */}
      </Container>
    </SafeAreaView>
  );
}
