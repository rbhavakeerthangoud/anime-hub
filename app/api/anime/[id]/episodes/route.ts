import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `https://api.tenrai.org/v1/anime/${id}/episodes`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch episodes" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Episodes API error:", error);

    return NextResponse.json(
      { error: "Failed to connect to episodes API" },
      { status: 500 }
    );
  }
}