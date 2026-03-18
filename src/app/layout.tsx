import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "ThinkNPost — AI Social Media Content Generator",
    template: "%s | ThinkNPost",
  },
  description:
    "Generate optimized social media posts for Twitter, LinkedIn, Instagram, and TikTok with AI. Powered by Google Gemini.",
  keywords: [
    "AI",
    "social media",
    "content generator",
    "Twitter",
    "LinkedIn",
    "Instagram",
    "TikTok",
    "AI posts",
    "content creation",
  ],
  authors: [{ name: "ThinkNPost" }],
  metadataBase: new URL("https://thinknpost.vercel.app"),
  openGraph: {
    title: "ThinkNPost — AI Social Media Content Generator",
    description:
      "Generate optimized social media posts for Twitter, LinkedIn, Instagram, and TikTok in seconds with AI.",
    url: "https://thinknpost.vercel.app",
    siteName: "ThinkNPost",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThinkNPost — AI Social Media Content Generator",
    description:
      "Generate optimized social media posts for Twitter, LinkedIn, Instagram, and TikTok in seconds with AI.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} antialiased`}>
        <SessionProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
