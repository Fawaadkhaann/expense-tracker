
"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

export function AnimatedReportHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.header>
  );
}

export function AnimatedReportSection({
  children,
  className,
  delay = 0,
  hover = false,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
  hover?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -3 } : undefined}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedReportBar({
  width,
  delay = 0,
}: {
  width: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width }}
      transition={{
        duration: 0.65,
        delay,
        ease: "easeOut",
      }}
      className="h-full rounded-full bg-accent"
    />
  );
}
