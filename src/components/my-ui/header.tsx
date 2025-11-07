import React from "react";
import { cn } from "~/lib/utils";

export default function Header({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("my-4 flex w-full gap-2", className)} {...props}>
      {/* TODO: leading icons */}
      {children}
      {/* TODO: icons directly after label */}
      {/* TODO: trailing icons */}

      {/* TODO: Standardize on header size? */}
      {/* TODO: add sticky option */}
      {/* TODO: how about an abstract header that can be sticky, have leading, next to, and trailing areas... that can be be extended to Title, heading, subheading? */}
    </div>
  );
}
