"use client";

import ThemeSwitcher from "./ThemeSwitcher";
import BackgroundSelector from "./BackgroundSelector";

export default function Navbar({
  onThemeChange,
  onWallpaperChange,
}: {
  onThemeChange: (theme: string) => void;
  onWallpaperChange: (bg: string | null) => void;
}) {
  return (
    <nav className="flex justify-between items-center p-4 border-b border-gray-700">
      <h1 className="text-2xl font-bold">🎧 DJBBoy</h1>
      <div className="flex space-x-4">
        <ThemeSwitcher onChange={onThemeChange} />
        <BackgroundSelector onSelect={onWallpaperChange} />
      </div>
    </nav>
  );
}
