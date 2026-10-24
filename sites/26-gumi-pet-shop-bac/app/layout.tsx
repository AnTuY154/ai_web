import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { site } from "../data/site";
import "./globals.css";

export const metadata: Metadata = {
  title: site.seo.title,
  description: site.seo.description,
  keywords: [...site.seo.keywords],
  openGraph: {
    title: site.seo.title,
    description: site.seo.description,
    type: "website",
    locale: "vi_VN",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: site.palette.primary,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
