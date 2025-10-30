"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("dark");
  const [background, setBackground] = useState<string | null>(null);

  useEffect(() => {
    document.body.className = theme + (background ? " wallpaper" : "");
    if (background) document.body.style.backgroundImage = `url(${background})`;
    else document.body.style.backgroundImage = "";
  }, [theme, background]);

  return (
    <html lang="en">
      <body>
        <Navbar onThemeChange={setTheme} onWallpaperChange={setBackground} />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
