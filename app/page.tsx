"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Music } from "lucide-react";

interface Mix {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  created_at?: string;
}

export default function HomePage() {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example: fetch from API (Multer backend or Supabase)
    const fetchMixes = async () => {
      try {
        const res = await axios.get("/api/mixes");
        setMixes(res.data || []);
      } catch (err) {
        console.error("Error fetching mixes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMixes();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black/70 backdrop-blur-md text-gray-100 p-6 hidden md:flex flex-col justify-between">
        <div>
          <h1 className="flex items-center text-2xl font-bold text-yellow-400 mb-8">
            <Music className="mr-2 text-yellow-400" /> DJBBoy
          </h1>
          <nav className="space-y-4">
            <a href="/upload" className="block hover:text-yellow-400 transition">Upload</a>
            <a href="/upgrade" className="block hover:text-yellow-400 transition">Upgrade to Pro</a>
            <a href="/support" className="block hover:text-yellow-400 transition">Support</a>
          </nav>
        </div>
        <div className="text-xs text-gray-400 space-y-2">
          <a href="/legal" className="block hover:text-yellow-400">Legal Terms</a>
          <a href="/certificate" className="block hover:text-yellow-400">Certificate</a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <button className="md:hidden p-2 rounded border border-gray-700 hover:border-yellow-400">
            ☰
          </button>
          <h2 className="text-3xl font-semibold">Recent Mixes</h2>
          <div className="flex items-center space-x-4">
            <a
              href="/login"
              className="px-4 py-2 rounded-md border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
            >
              Sign Up
            </a>
          </div>
        </header>

        {/* Feed */}
        {loading ? (
          <p className="text-gray-400 text-center mt-20">Loading mixes...</p>
        ) : mixes.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">No mixes uploaded yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mixes.map((mix) => (
              <div
                key={mix.id}
                className="bg-gray-800/60 rounded-2xl shadow-lg overflow-hidden hover:scale-[1.02] transition"
              >
                <img
                  src={
                    mix.coverUrl ||
                    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"
                  }
                  alt={mix.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-yellow-400">{mix.title}</h3>
                  <p className="text-sm text-gray-400">{mix.artist}</p>
                  <button className="mt-3 w-full bg-yellow-400 text-black font-semibold py-2 rounded-lg hover:bg-yellow-500 transition">
                    Listen Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
