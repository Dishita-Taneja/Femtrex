"use client";

import { useState, useEffect, useCallback } from "react";
import { matchMentors, bookMentorSession } from "@/features/mentor-network/services/mentorService";

export function useMentors(uid: string = "priya-demo") {
  const [query, setQuery] = useState("");
  const [expertise, setExpertise] = useState<string>();
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  const loadMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await matchMentors({ query, expertise }, uid);
      setMentors(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch mentor matches from server.");
    } finally {
      setLoading(false);
    }
  }, [query, expertise, uid]);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  const handleBookSession = async (mentorId: string, agendaText: string = "Discuss scheme application and funding roadmap") => {
    setBookingStatus(`Booking session with mentor ${mentorId}...`);
    try {
      const res = await bookMentorSession(mentorId, [agendaText]);
      setBookingStatus(`Session confirmed! Booking ID: ${(res as any)?.booking_id || "confirmed"}`);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to book mentor session.");
      setBookingStatus(null);
      throw err;
    }
  };

  return {
    query,
    setQuery,
    expertise,
    setExpertise,
    mentors,
    loading,
    error,
    bookingStatus,
    bookSession: handleBookSession,
    refetch: loadMentors
  };
}
