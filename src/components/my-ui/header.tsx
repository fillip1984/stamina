import React from "react";
import { cn } from "~/lib/utils";

export default function Header({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("my-4 flex gap-2", className)} {...props}>
      {/* TODO: leading icons */}
      {children}
      {/* TODO: icons directly after label */}
      {/* TODO: trailing icons */}
    </div>
  );
}
