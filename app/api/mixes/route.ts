import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "1",
      title: "Deep Night Sessions",
      artist: "DJ Zelo",
      coverUrl: "https://images.unsplash.com/photo-1601933470628-9c31e37d8df3",
    },
    {
      id: "2",
      title: "Tech Flow Vol. 2",
      artist: "DJ Nova",
      coverUrl: "https://images.unsplash.com/photo-1526481280691-7e3c5c8b5901",
    },
  ];
  return NextResponse.json(data);
}
