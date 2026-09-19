import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      characterId: string;
    }>;
  }
) {
  try {
    const { id, characterId } = await params;

    const response = await fetch(
      `https://api.tenrai.org/v1/anime/${id}/characters/${characterId}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Character details API error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch character details" },
      { status: 500 }
    );
  }
}