"use client";

/**
 * Landing Motion Primitives
 * Lightweight, reusable animation wrappers for the public landing page.
 * Built on `motion/react` and fully respectful of `prefers-reduced-motion`.
 */

import * as React from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";

// Soft, expensive-looking easing curve shared across the page.
const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = HTMLMotionProps<"div"> & {
  /** Delay before the reveal starts, in seconds. */
  delay?: number;
  /** Vertical travel distance, in pixels. */
  y?: number;
};

/**
 * Reveal
 * Fades and lifts its children into view the first time they enter the viewport.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  ...props
}: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};

type StaggerProps = HTMLMotionProps<"div">;

/**
 * Stagger
 * Animates direct `StaggerItem` children in sequence as the group scrolls in.
 */
export function Stagger({ children, ...props }: StaggerProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={reduce ? undefined : containerVariants}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem
 * A single element within a `Stagger` group.
 */
export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();

  return (
    <motion.div variants={reduce ? undefined : itemVariants} {...props}>
      {children}
    </motion.div>
  );
}
