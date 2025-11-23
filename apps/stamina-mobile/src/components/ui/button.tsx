import { Pressable } from "react-native";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "~/styles/utils";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "text-primary-foreground hover:bg-primary/90 bg-white",
        destructive:
          "dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 bg-red-400 text-white hover:bg-red-400/90 focus-visible:ring-red-400/20",
        outline: "border border-white bg-black",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export default function Button({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants>) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Pressable>
  );
}
