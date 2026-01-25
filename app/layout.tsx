import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ava - AI Sales Agent",
  description: "Voice-first AI sales assistant with dynamic UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
