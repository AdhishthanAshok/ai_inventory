// Root layout with Inter + JetBrains Mono fonts, AuthProvider, and metadata
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Smart Wardrobe — AI Styling Assistant",
  description: "Digitize your wardrobe, get AI outfit recommendations, and evaluate new purchases intelligently.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${jetbrainsMono.variable}`}>
        <AuthProvider>
          <Navbar />
          <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
