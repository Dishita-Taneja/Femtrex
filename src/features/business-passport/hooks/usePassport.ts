"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchPassport, generatePassport, type PassportData } from "@/features/business-passport/services/passportService";

export function usePassport(uid: string = "priya-demo") {
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string>("startup_readiness");

  const loadPassport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPassport(uid);
      setPassport(data);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("404") || msg.includes("No passport found")) {
        // Auto-generate initial passport from profile data
        try {
          const generated = await generatePassport({
            name: "Priya Sharma",
            company: "TextCraft",
            industry: "Textile Manufacturing",
            location: "Maharashtra",
            stage: "Growth Stage",
            years_in_business: 2,
            annual_revenue: "₹25 Lakhs",
            team_size: 4,
            has_udyam: true,
            has_gst: true,
            has_bank_account: true,
            funding_need: "₹15 Lakhs",
            goals: ["expand production", "access government funding"],
            challenges: ["working capital requirements"]
          });
          setPassport(generated);
          setError(null);
        } catch (genErr: any) {
          setError("Your Business Passport has not been generated yet. Click 'Generate Passport' below to calculate your score.");
        }
      } else {
        // Strip raw JSON detail wrappers if present
        const cleanMsg = msg.replace(/^API call failed \[\d+\]: (?:\{.*"detail":"([^"]+)".*\}|.*)/, "$1") || "Failed to load Business Passport.";
        setError(cleanMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [uid]);


  useEffect(() => {
    loadPassport();
  }, [loadPassport]);

  const recalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await generatePassport({
        name: "Priya Sharma",
        company: "TextCraft",
        industry: "Textile Manufacturing",
        location: "Maharashtra",
        stage: "Growth Stage",
        years_in_business: 2,
        annual_revenue: "₹25 Lakhs",
        team_size: 4,
        has_udyam: true,
        has_gst: true,
        has_bank_account: true,
        funding_need: "₹15 Lakhs",
        goals: ["expand production", "access government funding"],
        challenges: ["working capital requirements"]
      });
      setPassport(updated);
    } catch (err: any) {
      setError(err?.message || "Failed to recalculate passport score.");
    } finally {
      setLoading(false);
    }
  };

  return {
    passport,
    loading,
    error,
    selectedDimension,
    setSelectedDimension,
    refetch: loadPassport,
    recalculate
  };
}
