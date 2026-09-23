"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HistoryAnime = {
  mal_id: number;
  title: string;
  image: string;
  rating: string | number;
  viewedAt: number;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryAnime[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("animehub_history") || "[]"
      );

      setHistory(Array.isArray(saved) ? saved : []);
    } catch (error) {
      console.error("Failed to load history:", error);
      setHistory([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const removeHistory = (id: number) => {
    const updated = history.filter(
      (anime) => String(anime.mal_id) !== String(id)
    );

    setHistory(updated);

    localStorage.setItem(
      "animehub_history",
      JSON.stringify(updated)
    );
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("animehub_history");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

          {/* LOGO */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-md ring-1 ring-slate-200 transition duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
              <img
                src="/icon.png"
                alt="Anime.Hub"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="leading-none">
              <div className="text-xl font-black tracking-tight sm:text-2xl">
                <span className="text-slate-900">
                  Anime
                </span>

                <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  .Hub
                </span>
              </div>

              <p className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Explore Beyond Reality
              </p>
            </div>
          </Link>

          {/* NAVIGATION */}

          <div className="flex items-center gap-1 sm:gap-2">

            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-violet-600 sm:px-4"
            >
              Home
            </Link>

            <Link
              href="/#trending"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-violet-600 sm:block"
            >
              Anime
            </Link>

            <Link
              href="/#genres"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-violet-600 sm:block"
            >
              Genres
            </Link>

            <Link
              href="/favorites"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-violet-600 sm:px-4"
            >
              ❤️ <span className="hidden sm:inline">Favorites</span>
            </Link>

            <div className="rounded-xl bg-violet-50 px-3 py-2 text-sm font-bold text-violet-600 sm:px-4">
              🕘 <span className="hidden sm:inline">History</span>
            </div>

          </div>
        </div>
      </nav>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-violet-50/70 to-blue-50/80">

        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">

          <div className="flex flex-col items-center text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-4 py-2 text-xs font-bold text-violet-600 shadow-sm backdrop-blur sm:text-sm">
              🕘 RECENTLY VIEWED
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              Your History
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Quickly return to anime you've recently
              explored on Anime.Hub.
            </p>

            {loaded && history.length > 0 && (
              <div className="mt-6 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 shadow-sm">
                {history.length} Recently Viewed
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">

        {!loaded ? (

          /* LOADING */

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 sm:lg:gap-6">

            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-64 animate-pulse bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 sm:h-80" />

                <div className="space-y-3 p-4">
                  <div className="h-5 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}

          </div>

        ) : history.length === 0 ? (

          /* EMPTY */

          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50 text-4xl">
              🕘
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Nothing here yet
            </p>

            <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
              No viewing history
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
              Explore an anime and it will automatically
              appear here for quick access later.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3 font-bold text-white shadow-lg shadow-violet-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              🔎 Explore Anime
            </Link>

          </div>

        ) : (

          <>
            {/* HEADER ACTION */}

            <div className="mb-7 flex items-center justify-between gap-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  Your Activity
                </p>

                <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                  Recently Viewed
                </h2>
              </div>

              <button
                onClick={clearHistory}
                className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-100 sm:px-4 sm:text-sm"
              >
                🗑️ Clear History
              </button>

            </div>

            {/* CARDS */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

              {history.map((anime, index) => (

                <div
                  key={`${anime.mal_id}-${index}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-100/60"
                >

                  {/* POSTER */}

                  <Link
                    href={`/Anime/${anime.mal_id}`}
                    className="block"
                  >
                    <div className="relative h-60 overflow-hidden bg-slate-100 sm:h-80">

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

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                      <div className="absolute left-2.5 top-2.5 rounded-full border border-white/50 bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-800 shadow-md backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
                        #{index + 1}
                      </div>

                      <div className="absolute right-2.5 top-2.5 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black text-slate-900 shadow-md sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
                        ⭐ {anime.rating ?? "N/A"}
                      </div>

                    </div>
                  </Link>

                  {/* INFO */}

                  <div className="p-3 sm:p-5">

                    <Link href={`/Anime/${anime.mal_id}`}>
                      <h2 className="min-h-[3rem] line-clamp-2 text-sm font-bold leading-5 text-slate-900 transition group-hover:text-violet-600 sm:min-h-[3.5rem] sm:text-lg sm:leading-6">
                        {anime.title}
                      </h2>
                    </Link>

                    <p className="mt-2 text-[10px] font-medium text-slate-400 sm:text-xs">
                      Viewed{" "}
                      {new Date(anime.viewedAt).toLocaleDateString()}
                    </p>

                    <div className="mt-4 flex items-center gap-2">

                      <Link
                        href={`/Anime/${anime.mal_id}`}
                        className="flex-1 rounded-xl bg-violet-50 px-3 py-2 text-center text-[10px] font-bold text-violet-600 transition hover:bg-violet-100 sm:text-xs"
                      >
                        View Anime →
                      </Link>

                      <button
                        onClick={() =>
                          removeHistory(anime.mal_id)
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-sm transition hover:bg-red-100 hover:text-red-600"
                        aria-label={`Remove ${anime.title} from history`}
                        title="Remove from history"
                      >
                        🗑️
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          </>
        )}

      </section>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="mt-8 bg-slate-950 px-4 py-12 text-center text-slate-400 sm:px-6">

        <div className="mx-auto max-w-7xl">

          <div className="flex items-center justify-center gap-3">

            <div className="h-10 w-10 overflow-hidden rounded-xl shadow-md ring-1 ring-white/10">
              <img
                src="/icon.png"
                alt="Anime.Hub"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-left">
              <div className="text-xl font-black">
                <span className="text-white">
                  Anime
                </span>

                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  .Hub
                </span>
              </div>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Explore Beyond Reality
              </p>
            </div>

          </div>

          <p className="mt-5 text-sm">
            Discover. Explore. Enjoy anime.
          </p>

          <div className="mx-auto mt-7 max-w-md border-t border-white/10 pt-6 text-xs text-slate-500">
            © 2026 Anime.Hub • Built for anime fans 🍥
          </div>

        </div>

      </footer>

    </main>
  );
}