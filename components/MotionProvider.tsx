"use client";

import { MotionConfig } from "motion/react";

/** Respects the user's reduced-motion preference for every animation. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
