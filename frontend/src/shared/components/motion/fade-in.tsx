"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  scale?: boolean;
}

const easeCurve = [0.23, 1, 0.32, 1] as const;

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.3,
  direction = "up",
  distance = 12,
  scale = true,
  ...props
}: FadeInProps) {
  const getInitialOffsets = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = {
    opacity: 0,
    ...getInitialOffsets(),
    ...(scale ? { scale: 0.96 } : {}),
  };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={initial}
      transition={{
        duration,
        delay,
        ease: easeCurve,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
