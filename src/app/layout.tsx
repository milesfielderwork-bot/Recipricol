import type { Metadata } from "next";
import "./globals.css";
import { archivo, jetbrainsMono } from "./fonts";

export const metadata: Metadata = {
  title: "Reciprocal — A Closed Golf Community",
  description:
    "A closed, tight knit golf community connecting members of golf clubs with nomadic golfers. Register your interest now.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full bg-black antialiased">{children}</body>
    </html>
  );
}
