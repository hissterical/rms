import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { HotelProvider } from "@/contexts/hotel-context";
import { GuestProvider } from "@/contexts/guest-context";
import { AuthProvider } from "@/contexts/auth-context";
import { PropertyProvider } from "@/contexts/property-context";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Sohraa",
  description:
    "Complete hotel management solution for reservations, housekeeping, and analytics",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.className} ${fredoka.variable}`}>
        <AuthProvider>
          <PropertyProvider>
            <HotelProvider>
              <GuestProvider>{children}</GuestProvider>
            </HotelProvider>
          </PropertyProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
