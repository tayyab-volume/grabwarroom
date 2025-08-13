"use client";

import localFont from "next/font/local";

const centuryGothic = localFont({
  src: "../../public/century-gothic/centurygothic.ttf",
  variable: "--font-century-gothic",
  weight: "400",
});

export default function NotDesktop() {
  return (
    <div
      className={` bg-white flex flex-col items-center justify-center px-6 py-80 text-center ${centuryGothic.variable}`}
      style={{ fontFamily: "var(--font-century-gothic)" }}
    >
      <h1 className="text-3xl font-extrabold text-black">
        This app is only accessible on desktop devices.
      </h1>
      <p className="mt-4 text-black max-w-lg mx-auto text-lg">
        Please access this application on a desktop or laptop for the best experience.
      </p>
    </div>
  );
}
