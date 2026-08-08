import { loginWithEmail, loginWithGoogle, resetPassword, signupWithEmail } from "@/lib/firebase/auth";
import type { AuthFormValues, AuthMode } from "@/features/auth/types/auth";

export async function submitAuth(mode: AuthMode, values: AuthFormValues) {
  if (mode === "forgot") {
    return resetPassword(values.email);
  }

  if (mode === "signup") {
    return signupWithEmail(values.email, values.password);
  }

  return loginWithEmail(values.email, values.password);
}

export { loginWithGoogle };
