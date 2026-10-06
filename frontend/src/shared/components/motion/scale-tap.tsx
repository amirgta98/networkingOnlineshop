"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export interface ScaleTapProps extends HTMLMotionProps<"div"> {
  tapScale?: number;
  hoverScale?: number;
}

export function ScaleTap({
  children,
  className,
  tapScale = 0.97,
  hoverScale = 1.02,
  ...props
}: ScaleTapProps) {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className={cn("inline-block", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
