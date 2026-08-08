export type AuthMode = "login" | "signup" | "forgot";

export type AuthFormValues = {
  email: string;
  password: string;
  name?: string;
  remember?: boolean;
};
