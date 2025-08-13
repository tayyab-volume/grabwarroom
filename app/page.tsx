"use client";
import Link from "next/link";
import localFont from "next/font/local";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Load Century Gothic font
const centuryGothic = localFont({
  src: "../public/century-gothic/centurygothic.ttf",
  variable: "--font-century-gothic",
  weight: "400",
});

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const verifyNetwork = async () => {
      try {
        // Get user's public IP
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        const userIP = data.ip;

        // Your office Wi-Fi's public IP prefix
        const allowedPrefix = "180.151";

        if (!userIP.startsWith(allowedPrefix)) {
          console.log(userIP)
          router.replace("/not-grabwarroom"); // Redirect if not matching prefix
          return;
        }
      } catch (error) {
        console.error("Error checking network:", error);
        router.replace("/not-grabwarroom");
        return;
      } finally {
        setLoading(false);
      }
    };

    verifyNetwork();

    if (window.innerWidth < 768) {
      router.replace("/not-desktop");
      return;
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black text-lg">Checking network...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-white flex flex-col ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-6 px-4 md:px-8 border-b border-gray-200">
        <div className="text-3xl font-extrabold text-black tracking-tight font-borel">
          GrabWarRoom
        </div>
        <nav>
          <Link href="/login">
            <button className="bg-black text-white cursor-pointer px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition duration-300">
              Login
            </button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 bg-white">
        <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 animate-fade-in font-borel">
          <div className="flex items-center gap-8">
            <span>GrabWarRoom by</span>
            <a href="https://volume.in/" target="_blank">
              <img
                src="/logo.png"
                alt="Volume Logo"
                className="h-12 md:h-26 mb-8 object-contain"
              />
            </a>
          </div>
        </h1>

        <p className="text-md md:text-md text-gray-600 max-w-2xl mb-8 animate-slide-up tracking-widest leading-tight">
          Streamline meeting room bookings at Volume Creative Ad Agency. Book
          your war room with creativity and efficiency.
        </p>

        <Link href="/dashboard">
          <button className="bg-black text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-800 transition duration-300 animate-pulse-custom cursor-pointer">
            Book War Room Now
          </button>
        </Link>
      </main>

      <footer className="w-full bg-gray-900 text-white py-6 text-center">
        <p className="text-sm">
          &copy; 2025{" "}
          <a
            href="https://volume.in"
            className="underline hover:text-gray-300 transition"
          >
            Volume.in
          </a>{" "}
          - Creative Ad Agency Delhi NCR | Branding & Advertising | Marketing
        </p>
      </footer>
    </div>
  );
}
