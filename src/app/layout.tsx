import type { Metadata } from "next";
import "@/app/globals.css";
import "@/styles/tokens.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Femtrex - AI Co-Founder for Women Entrepreneurs",
  description: "Empowering Women Entrepreneurs with an AI Co-Founder"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
