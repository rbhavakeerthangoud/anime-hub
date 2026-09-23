"use client";

import Link from "next/link";

type DiscoveryAnime = {
  mal_id: number;
  title: string;
  rating: string | number;
  genre: string;
  image: string;
};

type AnimeDiscoveryProps = {
  anime: DiscoveryAnime[];
};

function getRating(rating: string | number) {
  const value =
    typeof rating === "number"
      ? rating
      : parseFloat(String(rating));

  return Number.isNaN(value) ? 0 : value;
}

function AnimeCard({
  anime,
  rank,
}: {
  anime: DiscoveryAnime;
  rank?: number;
}) {
  return (
    <Link
      href={`/Anime/${anime.mal_id}`}
      className="group relative block w-[170px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/60 sm:w-[190px] md:w-[210px]"
    >
      {/* POSTER */}

      <div className="relative h-[240px] overflow-hidden bg-slate-100 sm:h-[270px]">

        {anime.image ? (
          <img
            src={anime.image}
            alt={anime.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
            No Image
          </div>
        )}

        {/* DARK GRADIENT */}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* RANK */}

        {rank !== undefined && (
          <div className="absolute left-2.5 top-2.5 flex h-8 min-w-8 items-center justify-center rounded-full bg-white/95 px-2 text-xs font-black text-slate-900 shadow-lg backdrop-blur">
            #{rank}
          </div>
        )}

        {/* RATING */}

        <div className="absolute right-2.5 top-2.5 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black text-slate-900 shadow-lg">
          ⭐ {anime.rating}
        </div>

        {/* TITLE ON IMAGE */}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-2 text-sm font-black leading-5 text-white">
            {anime.title}
          </h3>
        </div>
      </div>

      {/* CARD INFO */}

      <div className="p-3">

        <div className="flex items-center justify-between gap-2">

          <span className="max-w-[70%] truncate rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-600">
            {anime.genre}
          </span>

          <span className="text-[10px] font-bold text-violet-600 transition group-hover:translate-x-1">
            →
          </span>

        </div>

      </div>
    </Link>
  );
}

export default function AnimeDiscovery({
  anime,
}: AnimeDiscoveryProps) {
  if (!anime || anime.length === 0) {
    return null;
  }

  /*
   * TOP RATED
   */

  const topRated = [...anime]
    .sort(
      (a, b) =>
        getRating(b.rating) -
        getRating(a.rating)
    )
    .slice(0, 10);

  /*
   * FEATURED
   *
   * Keep the first few anime from the
   * current catalogue.
   */

  const featured = anime.slice(0, 8);

  /*
   * MORE TO EXPLORE
   */

  const explore = [...anime]
    .reverse()
    .slice(0, 10);

  return (
    <section className="border-y border-slate-200 bg-slate-50">

      {/* ================================================= */}
      {/* FEATURED */}
      {/* ================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">

        <div className="mb-6 flex items-end justify-between">

          <div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600 sm:text-sm">
              Discover
            </p>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              ✨ Featured Anime
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Explore anime from your current collection.
            </p>

          </div>

        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:gap-5 sm:px-0">
          {featured.map((anime) => (
            <AnimeCard
              key={`featured-${anime.mal_id}`}
              anime={anime}
            />
          ))}
        </div>

        <p className="mt-2 text-center text-[11px] font-medium text-slate-400 sm:hidden">
          Swipe to explore →
        </p>

      </div>

      {/* ================================================= */}
      {/* TOP RATED */}
      {/* ================================================= */}

      <div className="border-y border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">

          <div className="mb-6">

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-500 sm:text-sm">
              Community Picks
            </p>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              ⭐ Top Rated
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Highest-rated anime in the current catalogue.
            </p>

          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:gap-5 sm:px-0">

            {topRated.map((anime, index) => (
              <AnimeCard
                key={`top-${anime.mal_id}`}
                anime={anime}
                rank={index + 1}
              />
            ))}

          </div>

          <p className="mt-2 text-center text-[11px] font-medium text-slate-400 sm:hidden">
            Swipe to explore →
          </p>

        </div>

      </div>

      {/* ================================================= */}
      {/* MORE TO EXPLORE */}
      {/* ================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">

        <div className="mb-6">

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-sm">
            Keep Exploring
          </p>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            🎬 More Anime to Explore
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Discover more titles from the catalogue.
          </p>

        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:gap-5 sm:px-0">

          {explore.map((anime) => (
            <AnimeCard
              key={`explore-${anime.mal_id}`}
              anime={anime}
            />
          ))}

        </div>

        <p className="mt-2 text-center text-[11px] font-medium text-slate-400 sm:hidden">
          Swipe to explore →
        </p>

      </div>

    </section>
  );
}