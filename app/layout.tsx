import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader, Archivo_Black } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ThemeProvider from "@/app/components/ThemeProvider";
import DesignSwitcher from "@/app/components/DesignSwitcher";
import RevealInit from "@/app/components/RevealInit";
import "./globals.css";

import { siteConfig } from "@/app/site.config";

const { person, seo, social } = siteConfig;
const pageTitle = `${person.name} | ${person.title}`;

// Geist powers the default (bento) design and is the primary UI font —
// preload it so first paint is fast.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Mono is used by code blocks and the terminal design (rarely above the fold),
// so keep it out of the critical preload path.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Newsreader (editorial) and Archivo Black (brutalist) are only used once a
// visitor opts into those designs via the switcher. Don't preload them — they
// would otherwise block first paint on every page for fonts most visitors
// never see. They load on demand (with a swap fallback) when the design changes.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["Arial Black", "sans-serif"],
});

const designInitScript = `(function(){try{var d=localStorage.getItem("portfolio-design");if(d==="bento"||d==="editorial"||d==="brutalist"||d==="terminal"||d==="peacock"){document.documentElement.dataset.design=d;}}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: {
    default: pageTitle,
    template: `%s | ${person.name}`,
  },
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: person.name, url: seo.url }],
  creator: person.name,
  publisher: person.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: seo.url,
    title: pageTitle,
    description: seo.ogDescription,
    siteName: seo.siteName,
    images: [
      {
        url: seo.ogImage,
        width: 500,
        height: 500,
        alt: person.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: seo.ogDescription,
    images: [seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: seo.googleVerification,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    url: seo.url,
    image: `${seo.url}${person.profilePhoto}`,
    jobTitle: person.title,
    worksFor: {
      "@type": "Organization",
      name: person.currentEmployer,
    },
    knowsAbout: person.knowsAbout,
    sameAs: social.map((s) => s.href),
  };

  return (
    <html lang="en" data-design="peacock" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${archivoBlack.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: designInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider>
          {children}
          <DesignSwitcher />
          <RevealInit />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
