import type { VariantProps } from "class-variance-authority";
import { Pressable } from "react-native";
import { cva } from "class-variance-authority";

import { cn } from "~/styles/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  // "flex items-center justify-center rounded-2xl border px-2 py-1",
  {
    variants: {
      variant: {
        default: "border-white/30 bg-white",
        destructive: "border-red-600 border-white/30",
        outline: "border-white/30 bg-black",
      },
      // size: {
      //   default: "h-9 px-4 py-2 has-[>svg]:px-3",
      //   sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      //   lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      //   icon: "size-9",
      //   "icon-sm": "size-8",
      //   "icon-lg": "size-10",
      // },
    },
    defaultVariants: {
      variant: "default",
      // size: "default",
    },
  },
);

export default function Badge({
  className,
  variant,
  // size,
  children,
  ...props
}: React.ComponentProps<typeof Pressable> &
  VariantProps<typeof badgeVariants>) {
  return (
    <Pressable className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </Pressable>
  );
}
