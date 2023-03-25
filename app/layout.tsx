"use client";

import { Inter } from "next/font/google";

const inter = Inter({ weight: "500", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
          font-weight: 500;
        }
      `}</style>
      <body>{children}</body>
    </html>
  );
}
