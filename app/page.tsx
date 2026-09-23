"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AnimeDiscovery from "@/components/AnimeDiscovery";

type Anime = {
  mal_id: number;
  title: string;
  rating: string | number;
  genre: string;
  image: string;
  type?: string;
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

const animeTypes = [
  "All",
  "TV",
  "Movie",
  "OVA",
  "ONA",
  "Special",
];

const ratingOptions = [
  { label: "Any Rating", value: 0 },
  { label: "5+", value: 5 },
  { label: "6+", value: 6 },
  { label: "7+", value: 7 },
  { label: "8+", value: 8 },
  { label: "9+", value: 9 },
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

  /* ========================= */
  /* ADVANCED FILTERS */
  /* ========================= */

  const [showFilters, setShowFilters] = useState(false);

  const [selectedType, setSelectedType] =
    useState("All");

  const [minimumRating, setMinimumRating] =
    useState(0);

  const [sortBy, setSortBy] =
    useState("default");

  /* ========================= */
  /* LOAD ANIME */
  /* ========================= */

  const loadAnime = async (
    pageNumber: number,
    query = "",
    genreId: number | null = null
  ) => {
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams();

      params.set(
        "page",
        pageNumber.toString()
      );

      if (query.trim()) {
        params.set("q", query.trim());
      }

      if (genreId !== null) {
        params.set(
          "genres",
          genreId.toString()
        );
      }

      const response = await fetch(
        `/api/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load anime"
        );
      }

      const result = await response.json();

      const animeList: Anime[] =
        (result.data || []).map(
          (item: any) => ({
            mal_id: item.mal_id,
            title:
              item.title ?? "Unknown Title",

            rating:
              item.score ?? "N/A",

            genre:
              item.genres?.[0]?.name ??
              "Unknown",

            type:
              item.type ?? "Unknown",

            image:
              item.images?.jpg
                ?.large_image_url ??
              item.images?.jpg
                ?.image_url ??
              "",
          })
        );

      setApiAnime(animeList);

      setHasNextPage(
        result.pagination
          ?.has_next_page ?? false
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
  /* FILTERED ANIME */
  /* ========================= */

  const filteredAnime = useMemo(() => {
    let result = [...apiAnime];

    /* TYPE FILTER */

    if (selectedType !== "All") {
      result = result.filter(
        (anime) =>
          anime.type?.toLowerCase() ===
          selectedType.toLowerCase()
      );
    }

    /* RATING FILTER */

    if (minimumRating > 0) {
      result = result.filter((anime) => {
        const rating =
          typeof anime.rating === "number"
            ? anime.rating
            : parseFloat(
                String(anime.rating)
              );

        return (
          !Number.isNaN(rating) &&
          rating >= minimumRating
        );
      });
    }

    /* SORT */

    if (sortBy === "rating-high") {
      result.sort((a, b) => {
        const ratingA =
          typeof a.rating === "number"
            ? a.rating
            : parseFloat(
                String(a.rating)
              ) || 0;

        const ratingB =
          typeof b.rating === "number"
            ? b.rating
            : parseFloat(
                String(b.rating)
              ) || 0;

        return ratingB - ratingA;
      });
    }

    if (sortBy === "rating-low") {
      result.sort((a, b) => {
        const ratingA =
          typeof a.rating === "number"
            ? a.rating
            : parseFloat(
                String(a.rating)
              ) || 0;

        const ratingB =
          typeof b.rating === "number"
            ? b.rating
            : parseFloat(
                String(b.rating)
              ) || 0;

        return ratingA - ratingB;
      });
    }

    if (sortBy === "title-az") {
      result.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    if (sortBy === "title-za") {
      result.sort((a, b) =>
        b.title.localeCompare(a.title)
      );
    }

    return result;
  }, [
    apiAnime,
    selectedType,
    minimumRating,
    sortBy,
  ]);

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
    setSelectedGenreName(
      genreName
    );
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
    setSelectedGenreName(
      "All Anime"
    );
    setPage(1);

    loadAnime(
      1,
      activeSearch,
      null
    );
  };

  /* ========================= */
  /* RESET FILTERS */
  /* ========================= */

  const handleResetFilters = () => {
    setSelectedType("All");
    setMinimumRating(0);
    setSortBy("default");
    setShowFilters(false);
  };

  /* ========================= */
  /* NEXT */
  /* ========================= */

  const handleNext = () => {
    if (
      !hasNextPage ||
      loading
    )
      return;

    const nextPage =
      page + 1;

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
    if (
      page <= 1 ||
      loading
    )
      return;

    const previousPage =
      page - 1;

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

  const filtersActive =
    selectedType !== "All" ||
    minimumRating > 0 ||
    sortBy !== "default";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-md ring-1 ring-slate-200 transition duration-300 group-hover:scale-105 group-hover:shadow-lg sm:h-11 sm:w-11">
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

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-1 md:flex">

            <a
              href="#"
              className="rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-600"
            >
              Home
            </a>

            <a
              href="#trending"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-violet-600"
            >
              Anime
            </a>

            <a
              href="#genres"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-violet-600"
            >
              Genres
            </a>

            <Link
              href="/favorites"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-violet-600"
            >
              ❤️ Favorites
            </Link>

            <Link
              href="/history"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-violet-600"
            >
              🕘 History
            </Link>

          </div>

          {/* MOBILE NAV */}

          <div className="flex items-center gap-2 md:hidden">

            <Link
              href="/favorites"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg shadow-sm"
              aria-label="Favorites"
            >
              ❤️
            </Link>

            <a
              href="#trending"
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-md"
            >
              Browse
            </a>

          </div>

        </div>
      </nav>

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-violet-50/70 to-blue-50/80">

        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20 md:py-28">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-4 py-2 text-xs font-bold text-violet-600 shadow-sm backdrop-blur sm:px-5 sm:text-sm">
            <span className="animate-pulse">
              ✨
            </span>
            YOUR ANIME UNIVERSE
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-6xl md:text-7xl">

            Discover Your

            <span className="mt-2 block bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Next Favorite Anime
            </span>

          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-7 sm:text-lg sm:leading-7">
            Discover anime, explore characters,
            check ratings, browse genres and find
            your next obsession.
          </p>

          {/* SEARCH */}

          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-xl shadow-slate-200/70 backdrop-blur sm:mt-10 sm:flex-row sm:items-center sm:gap-0">

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
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
              />

            </div>

            {activeSearch && (
              <button
                onClick={handleClearSearch}
                className="mr-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:mr-2 sm:py-3"
              >
                Clear
              </button>
            )}

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-7"
            >
              {loading
                ? "Searching..."
                : "Search"}
            </button>

          </div>

          <p className="mt-4 text-xs font-medium text-slate-400 sm:text-sm">
            Press Enter to search
          </p>

          <div className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-6 text-xs font-semibold text-slate-500 sm:gap-10 sm:text-sm">

            <div>
              <span className="block text-lg font-black text-slate-900 sm:text-xl">
                8+
              </span>
              Genres
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div>
              <span className="block text-lg font-black text-slate-900 sm:text-xl">
                1000+
              </span>
              Anime
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div>
              <span className="block text-lg font-black text-slate-900 sm:text-xl">
                Free
              </span>
              Discovery
            </div>

          </div>

        </div>
      </section>

      {/* ================================================= */}
      {/* ANIME SECTION */}
      {/* ================================================= */}

      <section
        id="trending"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 md:py-16"
      >

        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600 sm:text-sm">
              Anime Collection
            </p>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">

              {activeSearch ? (
                <>🔎 Search Results</>
              ) : (
                <>🔥 {selectedGenreName}</>
              )}

            </h2>

            {activeSearch && (
              <p className="mt-2 text-sm text-slate-500">
                Results for:
                <span className="ml-2 font-bold text-violet-600">
                  "{activeSearch}"
                </span>
              </p>
            )}

          </div>

          {/* FILTER BUTTON */}

          <button
            onClick={() =>
              setShowFilters(
                !showFilters
              )
            }
            className={`flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition sm:w-auto ${
              filtersActive
                ? "border-violet-300 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
            }`}
          >
            ⚙️ Advanced Filters

            {filtersActive && (
              <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] text-white">
                Active
              </span>
            )}

            <span
              className={`transition-transform ${
                showFilters
                  ? "rotate-180"
                  : ""
              }`}
            >
              ▼
            </span>
          </button>

        </div>

        {/* ================================================= */}
        {/* ADVANCED FILTER PANEL */}
        {/* ================================================= */}

        {showFilters && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-6">

            <div className="grid gap-5 md:grid-cols-3">

              {/* TYPE */}

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                  📺 Type
                </label>

                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  {animeTypes.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* RATING */}

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                  ⭐ Minimum Rating
                </label>

                <select
                  value={minimumRating}
                  onChange={(e) =>
                    setMinimumRating(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  {ratingOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* SORT */}

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                  ↕️ Sort By
                </label>

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="default">
                    Default
                  </option>

                  <option value="rating-high">
                    Rating: High → Low
                  </option>

                  <option value="rating-low">
                    Rating: Low → High
                  </option>

                  <option value="title-az">
                    Title: A → Z
                  </option>

                  <option value="title-za">
                    Title: Z → A
                  </option>
                </select>
              </div>

            </div>

            {/* FILTER SUMMARY */}

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs font-medium text-slate-500">
                {filtersActive
                  ? "Advanced filters are currently active."
                  : "Choose filters to refine the anime shown on this page."}
              </p>

              <button
                onClick={
                  handleResetFilters
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                🔄 Reset Filters
              </button>

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* PAGE */}
        {/* ================================================= */}

        <div className="mb-6 flex justify-end">

          <div className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:text-sm">
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

            <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
              Loading anime...
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

              {Array.from({
                length: 8,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="h-64 animate-pulse bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 sm:h-80" />

                    <div className="space-y-3 p-4 sm:p-5">
                      <div className="h-5 animate-pulse rounded-lg bg-slate-200" />
                      <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-100" />
                      <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
                    </div>
                  </div>
                )
              )}

            </div>

          </>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {!loading &&
          error && (
            <div className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white px-6 py-14 text-center shadow-lg">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                ⚠️
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-500">
                Connection Problem
              </p>

              <h3 className="text-2xl font-black text-slate-900">
                Something went wrong
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                We couldn't load the anime right now.
                Please try again in a moment.
              </p>

              <button
                onClick={() =>
                  loadAnime(
                    page,
                    activeSearch,
                    selectedGenre
                  )
                }
                className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 font-bold text-white shadow-lg"
              >
                🔄 Try Again
              </button>

            </div>
          )}

        {/* ================================================= */}
        {/* NO RESULTS */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          filteredAnime.length === 0 && (

            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                🔍
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                No anime found
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                No anime on this page matches
                your selected filters.
              </p>

              {filtersActive && (
                <button
                  onClick={
                    handleResetFilters
                  }
                  className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg"
                >
                  Reset Filters
                </button>
              )}

            </div>
          )}

        {/* ================================================= */}
        {/* ANIME CARDS */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          filteredAnime.length > 0 && (

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

              {filteredAnime.map(
                (item, index) => (

                  <Link
                    key={item.mal_id}
                    href={`/Anime/${item.mal_id}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-100/60"
                  >

                    {/* POSTER */}

                    <div className="relative h-60 overflow-hidden bg-slate-100 sm:h-80">

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

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                      <div className="absolute left-2.5 top-2.5 rounded-full border border-white/50 bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-800 shadow-md backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
                        #{(page - 1) * 24 + index + 1}
                      </div>

                      <div className="absolute right-2.5 top-2.5 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black text-slate-900 shadow-md sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
                        ⭐ {item.rating}
                      </div>

                    </div>

                    {/* CARD INFO */}

                    <div className="p-3 sm:p-5">

                      <h3 className="line-clamp-2 min-h-[3rem] text-sm font-bold leading-5 text-slate-900 transition group-hover:text-violet-600 sm:min-h-[3.5rem] sm:text-lg sm:leading-6">
                        {item.title}
                      </h3>

                      <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4">

                        <span className="max-w-[60%] truncate rounded-full bg-violet-50 px-2.5 py-1.5 text-[10px] font-bold text-violet-600 sm:px-3 sm:text-xs">
                          {item.genre}
                        </span>

                        <span className="text-[10px] font-bold text-violet-600 transition group-hover:translate-x-1 sm:text-xs">
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
          !error &&
          apiAnime.length > 0 && (

            <div className="mt-9 flex items-center justify-center gap-2 sm:mt-12 sm:gap-3">

              <button
                onClick={
                  handlePrevious
                }
                disabled={
                  page === 1 ||
                  loading
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:py-3 sm:text-base"
              >
                ←{" "}
                <span className="hidden sm:inline">
                  Previous
                </span>
              </button>

              <div className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-200 sm:px-5 sm:py-3 sm:text-base">
                {page}
              </div>

              <button
                onClick={
                  handleNext
                }
                disabled={
                  !hasNextPage ||
                  loading
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:py-3 sm:text-base"
              >
                <span className="hidden sm:inline">
                  Next{" "}
                </span>
                →
              </button>

            </div>
          )}

      </section>

            {/* ================================================= */}
      {/* ANIME DISCOVERY */}
      {/* ================================================= */}

      <AnimeDiscovery anime={apiAnime} />


      {/* ================================================= */}
      {/* GENRES */}
      {/* ================================================= */}

      <section
        id="genres"
        className="border-y border-slate-200 bg-white"
      >

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">

          <div className="mb-7 sm:mb-8">

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600 sm:text-sm">
              Explore
            </p>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              🎭 Browse by Genre
            </h2>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Find anime based on what you feel like watching.
            </p>

          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">

            <button
              onClick={
                handleAllAnime
              }
              className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold transition sm:px-5 sm:py-3 sm:text-sm ${
                selectedGenre === null
                  ? "border-violet-600 bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
              }`}
            >
              🌟 All Anime
            </button>

            {genres.map(
              (genre) => (
                <button
                  key={genre.id}
                  onClick={() =>
                    handleGenre(
                      genre.id,
                      genre.name
                    )
                  }
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold transition sm:px-5 sm:py-3 sm:text-sm ${
                    selectedGenre ===
                    genre.id
                      ? "border-violet-600 bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
                  }`}
                >
                  {genre.name}
                </button>
              )
            )}

          </div>

          <p className="mt-3 text-center text-[11px] font-medium text-slate-400 sm:hidden">
            Swipe to explore genres →
          </p>

        </div>
      </section>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="bg-slate-950 px-4 py-12 text-center text-slate-400 sm:px-6">

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