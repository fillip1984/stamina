import type { VariantProps } from "class-variance-authority";
import { Text } from "react-native";
import { cva } from "class-variance-authority";

import { cn } from "~/styles/utils";

const typographyVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "text-white",
        destructive: "text-red-400",
        heading: "font-bold text-white",
        muted: "text-gray-400",
      },
      size: {
        default: "text-base",
        small: "text-sm",
        large: "text-xl",
        subheading: "text-3xl",
        heading: "text-2xl",
        title: "text-4xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export default function Typography({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof Text> &
  VariantProps<typeof typographyVariants>) {
  return (
    <Text
      className={cn(typographyVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Text>
  );
}
