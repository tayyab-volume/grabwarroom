import type { Metadata } from "next";
import { Gothic_A1, Borel } from "next/font/google";
import "./globals.css";

const gothicA1 = Gothic_A1({
  weight: ["400", "700", "900"],
  variable: "--font-gothic-a1",
  subsets: ["latin"],
});

const borel = Borel({
  weight: "400",
  variable: "--font-borel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrabWarRoom by Volume",
  description: "Streamline meeting room bookings at Volume Creative Ad Agency Delhi NCR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${gothicA1.variable} ${borel.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}