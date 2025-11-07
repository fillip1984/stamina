"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { FaArrowUp } from "react-icons/fa6";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { is } from "date-fns/locale";

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
  }, []);

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
       *    w-full --- full width on smaller screens
       *    md:mx-auto md:w-[800px] --- centered and constrained width on md+ screens
       *    px-4 --- padding on sides, especially the side with the scrollbar so it doesn't overlap content
       */}
      <div className="flex w-full flex-col px-4 md:mx-auto md:w-[800px]">
        {children}
        {/* not exactly happy with leaving behind an empty div but it does serve to add a little padding at the bottom so scrollable content doesn't rest right against the window */}
        <div className="flex justify-center py-4">
          {isScrollToTopVisible && <ScrollToTopButton onClick={scrollToTop} />}
        </div>
      </div>
    </div>
  );
}

const ScrollToTopButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      variant={"outline"}
      size={"lg"}
      className="rounded-full"
      onClick={onClick}
    >
      <FaArrowUp />
    </Button>
  );
};
