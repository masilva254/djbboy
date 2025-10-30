"use client";

export default function ThemeSwitcher({
  onChange,
}: {
  onChange: (theme: string) => void;
}) {
  return (
    <select
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border border-gray-500 rounded px-2 py-1"
    >
      <option value="dark">Dark</option>
      <option value="light">Light</option>
      <option value="neon">Neon</option>
    </select>
  );
}
