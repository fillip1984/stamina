"use client";

import React from "react";
import { Button } from "../ui/button";
import { FaArrowUp } from "react-icons/fa6";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

export const scrollableContainerVariants = cva("flex grow overflow-y-auto");

// TODO: might want to add variants like container size... see shadcn's button.tsx for reference
export default function ScrollableContainer({
  className,
  children,
  scrollToTopButton = false,
  ...props
}: React.ComponentProps<"div"> & {
  scrollToTopButton?: boolean;
}) {
  const divRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    divRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={cn(scrollableContainerVariants({ className }))}
      {...props}
      ref={divRef}
    >
      <div className="flex w-full flex-col px-4 md:mx-auto md:w-[800px]">
        {children}
        {scrollToTopButton && <ScrollToTopButton onClick={scrollToTop} />}
      </div>
    </div>
  );
}

const ScrollToTopButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="flex justify-center py-10">
      <Button
        variant={"outline"}
        size={"lg"}
        className="mx-auto rounded-full"
        onClick={onClick}
      >
        <FaArrowUp />
      </Button>
    </div>
  );
};
