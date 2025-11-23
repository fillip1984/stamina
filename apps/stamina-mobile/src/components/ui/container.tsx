import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "~/styles/utils";

const containerVariants = cva("flex h-full", {
  variants: {
    variant: {
      default: "bg-black",
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
}: React.ComponentProps<typeof SafeAreaView> &
  VariantProps<typeof containerVariants>) {
  return (
    <View className={cn(containerVariants({ variant }), className)} {...props}>
      {children}
    </View>
  );
}
