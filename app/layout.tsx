import type { Metadata } from "next";
import { Manrope, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://curioquest.com"),
  title: {
    default: "CurioQuest | Learn. Believe. Grow.",
    template: "%s | CurioQuest",
  },
  description:
    "CurioQuest is a safe, guided learning platform for kids. Friendly AI coaches help children truly understand math, reading, and life skills - one question at a time.",
  keywords: [
    "AI tutoring for kids",
    "online learning for children",
    "math help for kids",
    "reading coach",
    "life skills for kids",
    "safe AI for children",
    "kids learning platform",
    "guided learning",
    "parent approved learning",
    "elementary tutoring",
  ],
  authors: [{ name: "CurioQuest", url: "https://curioquest.com" }],
  creator: "CurioQuest",
  publisher: "CurioQuest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://curioquest.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://curioquest.com",
    siteName: "CurioQuest",
    title: "CurioQuest | Learn. Believe. Grow.",
    description:
      "CurioQuest is a safe, guided learning platform for kids. Friendly AI coaches help children truly understand math, reading, and life skills - one question at a time.",
    images: [
      {
        url: "/curioquest-logo.svg",
        width: 1200,
        height: 630,
        alt: "CurioQuest - Learn. Believe. Grow.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CurioQuest | Learn. Believe. Grow.",
    description:
      "CurioQuest is a safe, guided learning platform for kids. Friendly AI coaches help children truly understand math, reading, and life skills - one question at a time.",
    images: ["/curioquest-logo.svg"],
    creator: "@curioquest",
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <head>
        {/* Skip to main content link for keyboard users - WCAG 2.4.1 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${manrope.variable} ${dmSans.variable} font-sans antialiased`}>
        {/* Skip to main content link - WCAG 2.4.1 Bypass Blocks */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
