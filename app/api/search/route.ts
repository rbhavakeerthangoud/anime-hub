import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || "";
    const page = searchParams.get("page") || "1";
    const genres = searchParams.get("genres") || "";

    const params = new URLSearchParams();

    params.set("limit", "24");
    params.set("page", page);

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (genres.trim()) {
      params.set("genres", genres);
    }

    const url = `https://api.tenrai.org/v1/anime?${params.toString()}`;

    console.log("Tenrai API:", url);

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch anime",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API error:", error);

    return NextResponse.json(
      {
        error: "Failed to connect to anime API",
      },
      { status: 500 }
    );
  }
}