"use client";

import { useMemo } from "react";
import { getResources } from "@/features/resources/services/resourceService";

export function useResources() {
  return useMemo(() => getResources(), []);
}
