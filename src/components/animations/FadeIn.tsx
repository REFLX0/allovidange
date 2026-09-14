"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export function FadeIn({ children, delay = 0, direction = "up", className = "" }: FadeInProps) {
  const reduceMotion = useReducedMotion();

  const getInitial = () => {
    if (reduceMotion || direction === "none") return { opacity: 0 };
    switch (direction) {
      case "up": return { opacity: 0, y: 30 };
      case "down": return { opacity: 0, y: -30 };
      case "left": return { opacity: 0, x: 30 };
      case "right": return { opacity: 0, x: -30 };
    }
  };

  const getAnimate = () => {
    if (reduceMotion || direction === "none") return { opacity: 1 };
    return { opacity: 1, y: 0, x: 0 };
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={getAnimate()}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ 
        duration: 0.7, 
        ease: [0.23, 1, 0.32, 1],
        delay: delay 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode, className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
        visible: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
