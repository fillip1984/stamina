"use client";

import React, { useEffect } from "react";
import { cva } from "class-variance-authority";
import { FaArrowUp } from "react-icons/fa6";

import { cn } from "~/lib/utils";
import { Button } from "../button";

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
  const [isScrollToTopVisible, setIsScrollToTopVisible] = React.useState(false);
  useEffect(() => {
    const handleScroll = () => {
      // check first the option is enabled
      if (!scrollToTopButton) return;

      if (divRef.current) {
        // Check if the section is scrolled down from its top, not just a little but enough to warrant a scroll-to-top button
        setIsScrollToTopVisible(divRef.current.scrollTop > 500);
      }
    };
    const currentRef = divRef.current; // Store current ref to avoid issues with closure
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, [scrollToTopButton]);

  const scrollToTop = () => {
    divRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={cn(scrollableContainerVariants({ className }))}
      {...props}
      ref={divRef}
    >
      {/* defaults to:
       *    flex --- because why not
       *    flex-col --- scrolling up and down
       *    items-center --- center children horizontally //TODO: this might be a mistake, if you keep finding yourself overriding this then remove it
       *    w-full --- full width on smaller screens
       *    sm:mx-auto sm:w-[600px] md:w-[800px] --- centered and constrained width on screens
       *    px-4 --- padding on sides, especially the side with the scrollbar so it doesn't overlap content
       */}
      <div className="flex w-full flex-col items-center px-4 sm:mx-auto sm:w-[600px] lg:w-[800px]">
        {children}
        {isScrollToTopVisible && <ScrollToTopButton onClick={scrollToTop} />}
      </div>
    </div>
  );
}

const ScrollToTopButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="flex justify-center py-4">
      <Button
        variant={"outline"}
        size={"lg"}
        className="rounded-full"
        onClick={onClick}
      >
        <FaArrowUp />
      </Button>
    </div>
  );
};
