import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Regis Road / Fieldnotes",
  description: "An evolving field atlas of housing, care, shared life, production and belonging.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
