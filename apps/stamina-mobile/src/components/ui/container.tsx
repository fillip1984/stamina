import type { VariantProps } from "class-variance-authority";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { cva } from "class-variance-authority";

import { cn } from "~/styles/utils";

const containerVariants = cva("flex h-screen", {
  variants: {
    variant: {
      default: "bg-black",
      sheet: "bg-zinc-800",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export default function Container({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof TouchableWithoutFeedback> &
  VariantProps<typeof containerVariants>) {
  return (
    <TouchableWithoutFeedback
      onPress={() => Keyboard.dismiss()}
      className={cn(containerVariants({ variant }), className)}
      {...props}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // 'padding' or 'height' often work well for formsheets
        style={{ flex: 1 }} // Ensures the view takes up available space
        contentContainerStyle={{ flexGrow: 1 }} // Useful if you have scrollable content
      >
        <View className={cn(containerVariants({ variant }), className)}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
