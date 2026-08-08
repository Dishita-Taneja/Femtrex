"use client";

import { motion } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";

export function AnimatedButton(props: ButtonProps) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Button {...props} />
    </motion.div>
  );
}
