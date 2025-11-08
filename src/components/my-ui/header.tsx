import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { cn } from "~/lib/utils";

export default function Header({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("my-4 flex w-full items-center gap-2", className)}
      {...props}
    >
      {children}

      {/* TODO: Standardize on header size? */}
      {/* TODO: add sticky option */}
      {/* TODO: how about an abstract header that can be sticky, have leading, next to, and trailing areas... that can be be extended to Title, heading, subheading? */}
    </div>
  );
}

const headerActionsVariants = cva("flex gap-2", {
  variants: {
    variant: {
      default: "pl-1",
      leading: "pr-1",
      trailing: "ml-auto",
    },
  },
  defaultVariants: { variant: "default" },
});

export const HeaderActions = ({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof headerActionsVariants>) => {
  return (
    <div
      className={cn(headerActionsVariants({ variant, className }))}
      {...props}
    >
      {children}
    </div>
  );
};
