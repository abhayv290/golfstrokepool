import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { getSessionUser } from "@/actions/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GolfStrokePool",
  description: "A transparent platform where your Stableford scores drive charitable impact and monthly prize draws.",
  keywords: ["golf", "stableford", "charity", "monthly draw", "prizes", "transparent", "community"],
  openGraph: {
    title: "GolfStrokePool",
    description: "A transparent platform where your Stableford scores drive charitable impact and monthly prize draws.",
    url: "https://golfstrokepool.com",
    siteName: "GolfStrokePool",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await getSessionUser()
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-screen font-sans antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <Toaster />
        <main className="grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
