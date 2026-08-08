"use client";

import { motion } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";

export function GradientButton(props: ButtonProps) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }}>
      <Button variant="gradient" {...props} />
    </motion.div>
  );
}
