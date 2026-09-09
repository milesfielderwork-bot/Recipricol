import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Reciprocal — A Closed Golf Community",
  description:
    "A closed, tight knit golf community connecting members of golf clubs with nomadic golfers. Register your interest now.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} h-full`}>
      <body className="min-h-full bg-black antialiased">{children}</body>
    </html>
  );
}
