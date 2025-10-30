"use client";

const wallpapers = [
  { name: "None", url: null },
  { name: "City Lights", url: "https://images.unsplash.com/photo-1530651788727-81f6c0f1e0b3" },
  { name: "Studio", url: "https://images.unsplash.com/photo-1593697973415-1f408e8b7f25" },
  { name: "Abstract", url: "https://images.unsplash.com/photo-1557683316-973673baf926" },
];

export default function BackgroundSelector({
  onSelect,
}: {
  onSelect: (bg: string | null) => void;
}) {
  return (
    <select
      onChange={(e) => onSelect(e.target.value || null)}
      className="bg-transparent border border-gray-500 rounded px-2 py-1"
    >
      {wallpapers.map((w) => (
        <option key={w.name} value={w.url ?? ""}>
          {w.name}
        </option>
      ))}
    </select>
  );
}
