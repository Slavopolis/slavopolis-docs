import { GlobalMenu } from "@/components/global/GlobalMenu";
import { IconFontLoader } from "@/components/iconfont-loader";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeShortcut } from "@/components/theme/theme-shortcut";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.seo.keywords],
  authors: [
    {
      name: siteConfig.seo.author,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.seo.author,
  openGraph: {
    type: "website",
    locale: siteConfig.language,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.seo.ogImage],
    creator: siteConfig.seo.twitterHandle,
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
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
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <ThemeToggle />
            <ThemeShortcut />
            <GlobalMenu />
            <IconFontLoader />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
} 