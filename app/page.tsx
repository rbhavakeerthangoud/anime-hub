"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Anime = {
  mal_id: number;
  title: string;
  rating: string | number;
  genre: string;
  image: string;
};

type Genre = {
  name: string;
  id: number;
};

const genres: Genre[] = [
  { name: "Action", id: 1 },
  { name: "Adventure", id: 2 },
  { name: "Comedy", id: 4 },
  { name: "Fantasy", id: 10 },
  { name: "Romance", id: 22 },
  { name: "Horror", id: 14 },
  { name: "Sports", id: 30 },
  { name: "Mystery", id: 7 },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [apiAnime, setApiAnime] = useState<Anime[]>([]);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [selectedGenre, setSelectedGenre] =
    useState<number | null>(null);

  const [selectedGenreName, setSelectedGenreName] =
    useState("All Anime");

  const loadAnime = async (
    pageNumber: number,
    query = "",
    genreId: number | null = null
  ) => {
    setLoading(true);
setError(false);
    try {
      const params = new URLSearchParams();

      params.set("page", pageNumber.toString());

      if (query.trim()) {
        params.set("q", query.trim());
      }

      if (genreId !== null) {
        params.set("genres", genreId.toString());
      }

      const response = await fetch(
        `/api/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to load anime");
      }

      const result = await response.json();

      const animeList: Anime[] = (result.data || []).map(
        (item: any) => ({
          mal_id: item.mal_id,
          title: item.title,
          rating: item.score ?? "N/A",
          genre:
            item.genres?.[0]?.name ?? "Unknown",
          image:
            item.images?.jpg?.large_image_url ??
            item.images?.jpg?.image_url ??
            "",
        })
      );

      setApiAnime(animeList);

      setHasNextPage(
        result.pagination?.has_next_page ?? false
      );
    } catch (error) {
      console.error(
        "Failed to load anime:",
        error
      );

      setApiAnime([]);
setHasNextPage(false);
setError(true);
    } finally {
      setLoading(false);
    }
  };

  /* ========================= */
  /* INITIAL CATALOGUE */
  /* ========================= */

  useEffect(() => {
    loadAnime(1, "", null);
  }, []);

  /* ========================= */
  /* SEARCH */
  /* ========================= */

  const handleSearch = () => {
    const query = search.trim();

    if (!query) {
      setActiveSearch("");
      setPage(1);

      loadAnime(
        1,
        "",
        selectedGenre
      );

      return;
    }

    setActiveSearch(query);
    setPage(1);

    loadAnime(
      1,
      query,
      selectedGenre
    );

    setTimeout(() => {
      document
        .getElementById("trending")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  /* ========================= */
  /* ENTER KEY */
  /* ========================= */

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /* ========================= */
  /* CLEAR SEARCH */
  /* ========================= */

  const handleClearSearch = () => {
    setSearch("");
    setActiveSearch("");
    setPage(1);

    loadAnime(
      1,
      "",
      selectedGenre
    );
  };

  /* ========================= */
  /* GENRE */
  /* ========================= */

  const handleGenre = (
    genreId: number,
    genreName: string
  ) => {
    setSelectedGenre(genreId);
    setSelectedGenreName(genreName);
    setPage(1);

    loadAnime(
      1,
      activeSearch,
      genreId
    );

    setTimeout(() => {
      document
        .getElementById("trending")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  /* ========================= */
  /* ALL ANIME */
  /* ========================= */

  const handleAllAnime = () => {
    setSelectedGenre(null);
    setSelectedGenreName("All Anime");
    setPage(1);

    loadAnime(
      1,
      activeSearch,
      null
    );
  };

  /* ========================= */
  /* NEXT */
  /* ========================= */

  const handleNext = () => {
    if (!hasNextPage || loading) return;

    const nextPage = page + 1;

    setPage(nextPage);

    loadAnime(
      nextPage,
      activeSearch,
      selectedGenre
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ========================= */
  /* PREVIOUS */
  /* ========================= */

  const handlePrevious = () => {
    if (page <= 1 || loading) return;

    const previousPage = page - 1;

    setPage(previousPage);

    loadAnime(
      previousPage,
      activeSearch,
      selectedGenre
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">

          {/* LOGO */}

          <Link
            href="/"
            className="group text-2xl font-black tracking-tight"
          >
            <span className="text-slate-900">
              Anime
            </span>

            <span className="text-violet-600">
              .Hub
            </span>
          </Link>

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-8 md:flex">

            <a
              href="#"
              className="font-semibold text-violet-600"
            >
              Home
            </a>

            <a
              href="#trending"
              className="font-medium text-slate-600 transition hover:text-violet-600"
            >
              Anime
            </a>

            <a
              href="#genres"
              className="font-medium text-slate-600 transition hover:text-violet-600"
            >
              Genres
            </a>

          </div>

          {/* MOBILE NAV */}

          <div className="flex items-center gap-2 md:hidden">

            <a
              href="#trending"
              className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-600"
            >
              Browse
            </a>

          </div>

        </div>

      </nav>

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-violet-50/60 to-blue-50/70">

        {/* Decorative circles */}

        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-14 text-center sm:px-6 sm:py-20 md:py-28">

          {/* Badge */}

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-2 text-sm font-bold text-violet-600 shadow-sm">
            ✨ YOUR ANIME UNIVERSE
          </div>

          {/* Heading */}

          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-6xl md:text-7xl">

            Discover Your

            <span className="block bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Next Favorite Anime
            </span>

          </h1>

          {/* Description */}

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Discover anime, explore characters,
            check ratings, browse genres and find
            your next obsession.
          </p>

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

         <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60 sm:flex-row sm:items-center sm:gap-0">

            <div className="flex min-w-0 flex-1 items-center">

              <span className="pl-3 text-lg">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search anime..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={handleKeyDown}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400"
              />

            </div>

            {/* CLEAR */}

            {activeSearch && (
              <button
                onClick={handleClearSearch}
                className="mr-2 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Clear
              </button>
            )}

            {/* SEARCH BUTTON */}

            <button
              onClick={handleSearch}
              disabled={loading}
             className="w-full rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-7"
            >
              {loading
                ? "Searching..."
                : "Search"}
            </button>

          </div>

          {/* Quick hint */}

          <p className="mt-4 text-sm text-slate-400">
            Press Enter to search
          </p>

        </div>

      </section>

      {/* ================================================= */}
      {/* ANIME SECTION */}
      {/* ================================================= */}

      <section
        id="trending"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-6 md:py-16"
      >

        {/* SECTION HEADER */}

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-violet-600">
              Anime Collection
            </p>

            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">

              {activeSearch ? (
                <>🔎 Search Results</>
              ) : (
                <>🔥 {selectedGenreName}</>
              )}

            </h2>

            {activeSearch && (
              <p className="mt-2 text-slate-500">
                Results for:
                <span className="ml-2 font-bold text-violet-600">
                  "{activeSearch}"
                </span>
              </p>
            )}

          </div>

          {/* PAGE */}

          <div className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
            Page{" "}
            <span className="font-black text-slate-900">
              {page}
            </span>
          </div>

        </div>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
  <>
    <div className="mb-6 text-center text-sm font-semibold text-slate-500">
      Loading anime...
    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  <div className="h-72 animate-pulse bg-slate-200 sm:h-80" />

                  <div className="space-y-3 p-5">

                    <div className="h-5 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />

                  </div>

                </div>
              )
            )}

             </div>
  </>
)}

        {/* ================================================= */}
        {/* NO RESULTS */}
        {/* ================================================= */}
{!loading && error && (
  <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center shadow-sm">
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
      ⚠️
    </div>

    <h3 className="text-2xl font-black text-slate-900">
      Something went wrong
    </h3>

    <p className="mt-2 text-slate-500">
      We couldn't load the anime right now.
      Please try again.
    </p>

    <button
      onClick={() =>
        loadAnime(
          page,
          activeSearch,
          selectedGenre
        )
      }
      className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
    >
      🔄 Try Again
    </button>
  </div>
)}
        {!loading &&
  !error &&
  apiAnime.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-3xl">
                🔍
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                No anime found
              </h3>

              <p className="mt-2 text-slate-500">
                Try another search or browse
                a different genre.
              </p>

              {activeSearch && (
                <button
                  onClick={handleClearSearch}
                  className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  Back to Anime
                </button>
              )}

            </div>
          )}

        {/* ================================================= */}
        {/* ANIME CARDS */}
        {/* ================================================= */}

        {!loading &&
          apiAnime.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

              {apiAnime.map(
                (item, index) => (

                  <Link
                    key={item.mal_id}
                    href={`/Anime/${item.mal_id}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-violet-200 hover:shadow-xl hover:shadow-slate-200/70"
                  >

                    {/* POSTER */}

                    <div className="relative h-56 overflow-hidden bg-slate-100 sm:h-80">

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                          No Image
                        </div>
                      )}

                      {/* Gradient */}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition group-hover:opacity-100" />

                      {/* Number */}

                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-slate-800 shadow-sm">
                        #{(page - 1) * 24 + index + 1}
                      </div>

                      {/* Rating */}

                      <div className="absolute right-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-900 shadow-sm">
                        ⭐ {item.rating}
                      </div>

                    </div>

                    {/* CARD INFO */}

                    <div className="p-3 sm:p-5">

                      <h3 className="line-clamp-2 min-h-[3.5rem] text-base font-bold text-slate-900 transition group-hover:text-violet-600 sm:text-lg">
                        {item.title}
                      </h3>

                      <div className="mt-4 flex items-center justify-between gap-2">

                        <span className="max-w-[65%] truncate rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600">
                          {item.genre}
                        </span>

                        <span className="text-xs font-bold text-violet-600 transition group-hover:translate-x-1">
                          Details →
                        </span>

                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>
          )}

        {/* ================================================= */}
        {/* PAGINATION */}
        {/* ================================================= */}

        {!loading &&
          apiAnime.length > 0 && (

            <div className="mt-10 flex items-center justify-center gap-2 sm:mt-12 sm:gap-3">

              {/* PREVIOUS */}

              <button
                onClick={handlePrevious}
                disabled={
                  page === 1 ||
                  loading
                }className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-base"
                
              >
                ← Previous
              </button>

              {/* PAGE */}

              <div className="rounded-xl bg-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-violet-200">
                {page}
              </div>

              {/* NEXT */}

              <button
                onClick={handleNext}
                disabled={
                  !hasNextPage ||
                  loading
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>

            </div>

          )}

      </section>

      {/* ================================================= */}
      {/* GENRES */}
      {/* ================================================= */}

      <section
        id="genres"
        className="border-y border-slate-200 bg-white"
      >

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">

          <div className="mb-8">

            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-violet-600">
              Explore
            </p>

            <h2 className="text-3xl font-black text-slate-900">
              🎭 Browse by Genre
            </h2>

            <p className="mt-2 text-slate-500">
              Find anime based on what you
              feel like watching.
            </p>

          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">

            {/* ALL */}

            <button
              onClick={handleAllAnime}
              className={`shrink-0 rounded-full border px-5 py-3 text-sm font-bold transition ${
                selectedGenre === null
                  ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
              }`}
            >
              🌟 All Anime
            </button>

            {/* GENRES */}

            {genres.map((genre) => (

              <button
                key={genre.id}
                onClick={() =>
                  handleGenre(
                    genre.id,
                    genre.name
                  )
                }
                className={`shrink-0 rounded-full border px-5 py-3 text-sm font-bold transition ${
                  selectedGenre === genre.id
                    ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-200"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
                }`}
              >
                {genre.name}
              </button>

            ))}

          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="bg-slate-900 px-5 py-10 text-center text-slate-400">

        <div className="mx-auto max-w-7xl">

          <div className="text-2xl font-black">

            <span className="text-white">
              Anime
            </span>

            <span className="text-violet-400">
              .Hub
            </span>

          </div>

          <p className="mt-3 text-sm">
            Discover. Explore. Enjoy anime.
          </p>

          <div className="mt-6 border-t border-white/10 pt-6 text-xs text-slate-500">
            © 2026 Anime.Hub • Built for anime fans 🍥
          </div>

        </div>

      </footer>

    </main>
  );
}