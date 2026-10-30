import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/toaster";
import { SITE_NAME, VP_NAME, VP_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const title = `${SITE_NAME} by VP+ | Download Videos from Anywhere`;
const description =
  "Save your favorite videos from YouTube, Instagram, TikTok, X and more in high quality. Pick the quality and format, see the exact file size, and download. A product by Video Production+.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: SITE_NAME,
  authors: [{ name: VP_NAME, url: VP_URL }],
  publisher: VP_NAME,
  openGraph: { title, description, siteName: VP_NAME, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#070b16",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
