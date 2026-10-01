import { Archivo, JetBrains_Mono } from "next/font/google";

export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
