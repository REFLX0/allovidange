"use client";
import { motion } from "motion/react";

export function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "rgba(34,197,94,0.10)",
        border: "2px solid rgba(34,197,94,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 28px",
        boxShadow: "0 0 32px rgba(34,197,94,0.2)",
      }}
    >
      <motion.svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        <motion.polyline
          points="20 6 9 17 4 12"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}
