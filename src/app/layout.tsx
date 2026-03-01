import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frost - Until Dawn AI Horror",
  description: "An interactive AI-driven horror experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased antigravity-scroll-lock">
        {children}
      </body>
    </html>
  );
}
