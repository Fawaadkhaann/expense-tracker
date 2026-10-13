
"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

export function AnimatedAnalyticsHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.header>
  );
}

export function AnimatedAnalyticsCard({
  children,
  className,
  delay = 0,
  hover = true,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
  hover?: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: "easeOut",
      }}
      whileHover={hover ? { y: -4 } : undefined}
      className={className}
    >
      {children}
    </motion.article>
  );
}

export function AnimatedAnalyticsSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedAnalyticsBar({
  width,
  delay = 0,
  colorClass = "bg-accent",
}: {
  width: string;
  delay?: number;
  colorClass?: string;
}) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width }}
      transition={{
        duration: 0.7,
        delay,
        ease: "easeOut",
      }}
      className={`h-full rounded-full ${colorClass}`}
    />
  );
}
