import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    title: string;
  }>;
};

type AnimeData = {
  title?: string;
  title_japanese?: string;
  synopsis?: string;
  score?: number;
  images?: {
    jpg?: {
      image_url?: string;
      large_image_url?: string;
    };
  };
};

async function getAnime(id: string): Promise<AnimeData | null> {
  try {
    const response = await fetch(
      `https://api.tenrai.org/v1/anime/${encodeURIComponent(id)}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    return result.data ?? result;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { title: id } = await params;

  const anime = await getAnime(id);

  if (!anime) {
    return {
      title: "Anime Details | Anime.Hub",
      description:
        "Explore anime details, characters, episodes and ratings on Anime.Hub.",
    };
  }

  const animeTitle =
    anime.title || "Anime Details";

  const description =
    anime.synopsis ||
    `Explore ${animeTitle} on Anime.Hub. View characters, episodes, ratings, genres and more.`;

  const image =
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url;

  return {
    title: animeTitle,

    description,

    keywords: [
      animeTitle,
      `${animeTitle} anime`,
      `${animeTitle} characters`,
      `${animeTitle} episodes`,
      "anime",
      "Anime.Hub",
    ],

    alternates: {
      canonical: `https://anime-hub-lemon.vercel.app/Anime/${id}`,
    },

    openGraph: {
      title: `${animeTitle} | Anime.Hub`,
      description,
      url: `https://anime-hub-lemon.vercel.app/Anime/${id}`,
      siteName: "Anime.Hub",
      type: "website",

      ...(image
        ? {
            images: [
              {
                url: image,
                width: 460,
                height: 650,
                alt: animeTitle,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${animeTitle} | Anime.Hub`,
      description,

      ...(image
        ? {
            images: [image],
          }
        : {}),
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function AnimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}