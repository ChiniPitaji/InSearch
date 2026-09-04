import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// This font is built into Next.js. It makes the text look clean and modern.
const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusBridge | Jobs, internships, and campus placements",
  description:
    "A platform that connects students, companies, and colleges for internships, jobs, and campus placements.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  );
}
