/**
 * MentorFormData — fields collected from the registration form.
 * Matches the user-supplied subset of the Firestore mentor document schema.
 * System-managed fields (rating, sessions, review, nextSlot) are excluded.
 */
export interface MentorFormData {
  name: string;
  role: string;
  expertise: string[];
  industry: string;
  years_experience: number;
  price: string;
  bio: string;
  tags: string[];     // defaults to expertise on the backend if empty
}

/**
 * MentorProfile — full Firestore document shape.
 * Returned by POST /mentors/register and GET /mentors/match.
 */
export interface MentorProfile {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  industry: string;
  years_experience: number;
  rating: number;
  sessions: number;
  price: string;
  nextSlot: string;
  bio: string;
  tags: string[];
  review: string;
  status?: string;
  created_at?: string;
}

/**
 * MentorSession — a booking session saved in Firestore mentor_sessions collection.
 */
export interface MentorSession {
  id: string;
  mentor_id: string;
  mentor_name: string;
  uid: string;         // founder uid
  status: string;
  agenda: string[];
  preferred_slot: string;
  notes?: string;
  created_at: string;
}
