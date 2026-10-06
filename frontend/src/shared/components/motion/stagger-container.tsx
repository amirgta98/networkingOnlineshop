"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
  initialDelay?: number;
}

const defaultContainerVariants = (staggerDelay: number, initialDelay: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: initialDelay,
      staggerChildren: staggerDelay,
    },
  },
});

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.04,
  initialDelay = 0.02,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={defaultContainerVariants(staggerDelay, initialDelay)}
      initial="hidden"
      animate="visible"
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
