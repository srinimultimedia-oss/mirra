import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mirra Visual Workspace",
  description: "Create and collaborate on durable visual boards.",
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
