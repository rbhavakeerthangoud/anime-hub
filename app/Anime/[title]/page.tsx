"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Episode = {
  mal_id: number;
  title: string;
  title_japanese?: string;
  aired?: string;
  duration?: number;
  score?: number;
  filler?: boolean;
  recap?: boolean;
  synopsis?: string;
  images?: {
    jpg?: {
      image_url?: string;
      large_image_url?: string;
    };
  };
};

type Character = {
  mal_id: number;
  character?: {
    mal_id: number;
    name: string;
    images?: {
      jpg?: {
        image_url?: string;
        large_image_url?: string;
      };
    };
    url?: string;
  };
  role?: string;
  voice_actors?: {
    person?: {
      mal_id?: number;
      name?: string;
      images?: {
        jpg?: {
          image_url?: string;
        };
      };
    };
    language?: string;
  }[];
};

export default function AnimeDetails() {
  const params = useParams();

  const id = String(params.title);

  const [anime, setAnime] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // FAVORITES
  const [favorite, setFavorite] = useState(false);

  // THEME
  const [darkMode, setDarkMode] = useState(true);

  // EPISODES
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodePage, setEpisodePage] = useState(1);
  const [episodeHasNext, setEpisodeHasNext] = useState(false);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // CHARACTERS
  const [characters, setCharacters] = useState<Character[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [showAllCharacters, setShowAllCharacters] = useState(false);

  // CHARACTER DETAIL
  const [selectedCharacter, setSelectedCharacter] =
    useState<any>(null);

  const [characterLoading, setCharacterLoading] =
    useState(false);

  // --------------------------------
  // LOAD THEME
  // --------------------------------

  useEffect(() => {
    const savedTheme = localStorage.getItem("animehub-theme");

    if (savedTheme === "light") {
      setDarkMode(false);
    } else {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "animehub-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // --------------------------------
  // LOAD FAVORITE
  // --------------------------------

  useEffect(() => {
    if (!id) return;

    const favorites = JSON.parse(
      localStorage.getItem("animehub-favorites") || "[]"
    );

    setFavorite(
      favorites.some(
        (item: any) => String(item.mal_id) === String(id)
      )
    );
  }, [id]);

  // --------------------------------
  // ANIME DETAILS
  // --------------------------------

  useEffect(() => {
    async function loadAnime() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(`/api/anime/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch anime");
        }

        const result = await response.json();

        setAnime(result.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadAnime();
    }
  }, [id]);

  // --------------------------------
  // EPISODES
  // --------------------------------

  const loadEpisodes = async (pageNumber: number) => {
    try {
      setEpisodesLoading(true);

      const response = await fetch(
        `/api/anime/${id}/episodes?page=${pageNumber}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch episodes");
      }

      const result = await response.json();

      setEpisodes(result.data || []);

      setEpisodeHasNext(
        result.pagination?.has_next_page ?? false
      );

      setEpisodePage(pageNumber);
    } catch (error) {
      console.error(
        "Failed to load episodes:",
        error
      );

      setEpisodes([]);
      setEpisodeHasNext(false);
    } finally {
      setEpisodesLoading(false);
    }
  };

  // --------------------------------
  // CHARACTERS
  // --------------------------------

  const loadCharacters = async () => {
    try {
      setCharactersLoading(true);

      const response = await fetch(
        `/api/anime/${id}/characters`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch characters"
        );
      }

      const result = await response.json();

      setCharacters(result.data || []);
    } catch (error) {
      console.error(
        "Failed to load characters:",
        error
      );

      setCharacters([]);
    } finally {
      setCharactersLoading(false);
    }
  };

  // --------------------------------
  // LOAD EPISODES + CHARACTERS
  // --------------------------------

  useEffect(() => {
    if (!id) return;

    loadEpisodes(1);
    loadCharacters();
  }, [id]);

  // --------------------------------
  // FAVORITE
  // --------------------------------

  const toggleFavorite = () => {
    if (!anime) return;

    const favorites = JSON.parse(
      localStorage.getItem("animehub-favorites") || "[]"
    );

    if (favorite) {
      const updated = favorites.filter(
        (item: any) =>
          String(item.mal_id) !== String(anime.mal_id)
      );

      localStorage.setItem(
        "animehub-favorites",
        JSON.stringify(updated)
      );

      setFavorite(false);
    } else {
      const favoriteAnime = {
        mal_id: anime.mal_id,
        title: anime.title,
        image:
          anime.images?.jpg?.large_image_url ||
          anime.images?.jpg?.image_url ||
          "",
        rating: anime.score ?? "N/A",
      };

      const alreadyExists = favorites.some(
        (item: any) =>
          String(item.mal_id) ===
          String(anime.mal_id)
      );

      if (!alreadyExists) {
        favorites.push(favoriteAnime);
      }

      localStorage.setItem(
        "animehub-favorites",
        JSON.stringify(favorites)
      );

      setFavorite(true);
    }
  };

  // --------------------------------
  // CHARACTER DETAILS
  // --------------------------------

  const openCharacter = async (
    character: Character
  ) => {
    const characterId =
      character.character?.mal_id;

    if (!characterId) return;

    try {
      setCharacterLoading(true);
      setSelectedCharacter(null);

      const response = await fetch(
        `/api/anime/${id}/characters/${characterId}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch character"
        );
      }

      const result = await response.json();

      setSelectedCharacter(result.data);
    } catch (error) {
      console.error(
        "Character details error:",
        error
      );

      // Still show basic character information
      setSelectedCharacter(character);
    } finally {
      setCharacterLoading(false);
    }
  };

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return (
      <main
        className={`min-h-screen p-4 sm:p-10 ${
          darkMode
            ? "bg-slate-950 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <h1 className="text-3xl font-bold text-pink-500">
          Loading anime...
        </h1>
      </main>
    );
  }

  // --------------------------------
  // ERROR
  // --------------------------------

  if (error || !anime) {
    return (
      <main
        className={`min-h-screen p-4 sm:p-10 ${
          darkMode
            ? "bg-slate-950 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <h1 className="text-4xl font-bold text-pink-500">
          Anime Not Found
        </h1>

        <Link
          href="/"
          className="mt-6 inline-block text-purple-500"
        >
          ← Back to Anime.Hub
        </Link>
      </main>
    );
  }

  // --------------------------------
  // BASIC DATA
  // --------------------------------

  const title =
    anime.title ||
    anime.titles?.find(
      (t: any) => t.type === "Default"
    )?.title ||
    "Unknown Anime";

  const image =
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url ||
    anime.images?.jpg?.small_image_url;

  const genres =
    anime.genres
      ?.map((g: any) => g.name)
      .join(" • ") || "Unknown";

  // Show first 12 characters initially
  const visibleCharacters = showAllCharacters
    ? characters
    : characters.slice(0, 12);

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* ========================================= */}
      {/* NAVBAR */}
      {/* ========================================= */}

      <nav
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          darkMode
            ? "border-white/10 bg-slate-950/90"
            : "border-gray-200 bg-white/90"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">

          <Link
            href="/"
            className="text-2xl font-black"
          >
            <span className="text-pink-500">
              Anime
            </span>

            <span className="text-purple-500">
              .Hub
            </span>
          </Link>

          <div className="flex items-center gap-3">

            {/* HOME */}

            <Link
              href="/"
              className={`hidden rounded-xl px-4 py-2 font-semibold transition md:block ${
                darkMode
                  ? "hover:bg-white/10"
                  : "hover:bg-gray-200"
              }`}
            >
              Home
            </Link>

            {/* THEME */}

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className={`rounded-xl border px-4 py-2 text-xl transition ${
                darkMode
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-gray-200 bg-gray-100 hover:bg-gray-200"
              }`}
              title="Change theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

          </div>

        </div>
      </nav>

      {/* ========================================= */}
      {/* ANIME DETAILS */}
      {/* ========================================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

        {/* BACK */}

        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold text-pink-500 transition hover:text-pink-400"
        >
          ← Back to Anime.Hub
        </Link>

        <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[320px_1fr] lg:gap-10">

          {/* POSTER */}

          <div>
            <div
              className={`overflow-hidden rounded-3xl border shadow-2xl ${
                darkMode
                  ? "border-white/10 bg-white/5"
                  : "border-gray-200 bg-white"
              }`}
            >
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="h-[420px] w-full object-cover sm:h-[470px]"
                />
              ) : (
                <div className="flex h-[470px] items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>

            {/* FAVORITE */}

            <button
              onClick={toggleFavorite}
              className={`mt-5 w-full rounded-2xl px-6 py-4 font-bold transition ${
                favorite
                  ? "border border-pink-500 bg-pink-500/20 text-pink-400"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-[1.02]"
              }`}
            >
              {favorite
                ? "❤️ Added to Favorites"
                : "🤍 Add to Favorites"}
            </button>
          </div>

          {/* INFORMATION */}

          <div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">

              <div>
                <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-6xl">
                  {title}
                </h1>

                {anime.title_japanese && (
                  <p
                    className={`mt-3 ${
                      darkMode
                        ? "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    {anime.title_japanese}
                  </p>
                )}
              </div>

            </div>

            {/* BADGES */}

            <div className="mt-6 flex flex-wrap gap-3">

              <span className="rounded-full bg-yellow-400 px-4 py-2 font-bold text-black">
                ⭐ {anime.score ?? "N/A"}
              </span>

              <span
                className={`rounded-full px-4 py-2 ${
                  darkMode
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {genres}
              </span>

              {anime.type && (
                <span
                  className={`rounded-full px-4 py-2 ${
                    darkMode
                      ? "bg-white/10 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  🎬 {anime.type}
                </span>
              )}

            </div>

            {/* SYNOPSIS */}

            <div className="mt-8">

              <h2 className="text-2xl font-black">
                Synopsis
              </h2>

              <p
                className={`mt-4 text-lg leading-8 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                {anime.synopsis ||
                  "No description available."}
              </p>

            </div>

            {/* INFO CARDS */}

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">

              <InfoCard
                darkMode={darkMode}
                label="Episodes"
                value={
                  anime.episodes ?? "N/A"
                }
              />

              <InfoCard
                darkMode={darkMode}
                label="Status"
                value={
                  anime.status ?? "N/A"
                }
              />

              <InfoCard
                darkMode={darkMode}
                label="Rating"
                value={`⭐ ${
                  anime.score ?? "N/A"
                }`}
              />

              <InfoCard
                darkMode={darkMode}
                label="Year"
                value={
                  anime.year ??
                  anime.aired?.prop?.from?.year ??
                  "N/A"
                }
              />

              <InfoCard
                darkMode={darkMode}
                label="Duration"
                value={
                  anime.duration ?? "N/A"
                }
              />

              <InfoCard
                darkMode={darkMode}
                label="Popularity"
                value={
                  anime.popularity
                    ? `#${anime.popularity}`
                    : "N/A"
                }
              />

            </div>

          </div>
        </div>

      </section>

      {/* ========================================= */}
      {/* EPISODES */}
      {/* ========================================= */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-pink-500">
              Watch List
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              📺 Episodes
            </h2>

            <p
              className={`mt-2 ${
                darkMode
                  ? "text-gray-500"
                  : "text-gray-600"
              }`}
            >
              Episode information for {title}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              darkMode
                ? "bg-white/5 text-gray-300"
                : "bg-white text-gray-700 shadow-sm"
            }`}
          >
            Page {episodePage}
          </span>

        </div>

        {episodesLoading ? (
          <div
            className={`rounded-2xl border p-12 text-center ${
              darkMode
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="animate-pulse text-lg font-bold text-pink-500">
              Loading episodes...
            </p>
          </div>
        ) : episodes.length === 0 ? (
          <div
            className={`rounded-2xl border p-12 text-center ${
              darkMode
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-gray-500">
              No episode information available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {episodes.map((episode) => {

              const episodeImage =
                episode.images?.jpg
                  ?.large_image_url ||
                episode.images?.jpg
                  ?.image_url;

              return (
                <div
                  key={episode.mal_id}
                  className={`group rounded-2xl border p-4 transition hover:-translate-y-1 ${
                    darkMode
                      ? "border-white/10 bg-white/5 hover:border-pink-500/30"
                      : "border-gray-200 bg-white shadow-sm hover:border-pink-300"
                  }`}
                >
                  <div className="flex gap-3 sm:gap-5">

                    {/* EPISODE IMAGE */}

                    {episodeImage && (
                      <img
                        src={episodeImage}
                        alt={episode.title}
                        className="hidden h-24 w-40 rounded-xl object-cover sm:block"
                      />
                    )}

                    {/* EPISODE NUMBER */}

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 font-black text-white">
                      {episode.mal_id}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-start justify-between gap-3">

                        <h3 className="text-lg font-bold md:text-xl">
                          {episode.title ||
                            `Episode ${episode.mal_id}`}
                        </h3>

                        {episode.score && (
                          <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
                            ⭐ {episode.score}
                          </span>
                        )}

                      </div>

                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">

                        {episode.aired && (
                          <span>
                            📅{" "}
                            {new Date(
                              episode.aired
                            ).toLocaleDateString()}
                          </span>
                        )}

                        {episode.duration && (
                          <span>
                            ⏱️{" "}
                            {Math.round(
                              episode.duration /
                                60
                            )}{" "}
                            min
                          </span>
                        )}

                        {episode.filler && (
                          <span className="text-orange-400">
                            Filler
                          </span>
                        )}

                        {episode.recap && (
                          <span className="text-blue-400">
                            Recap
                          </span>
                        )}

                      </div>

                      {episode.synopsis && (
                        <p
                          className={`mt-3 line-clamp-2 text-sm leading-6 ${
                            darkMode
                              ? "text-gray-500"
                              : "text-gray-600"
                          }`}
                        >
                          {episode.synopsis}
                        </p>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* EPISODE PAGINATION */}

        {episodes.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4">

            <button
              onClick={() =>
                loadEpisodes(
                  episodePage - 1
                )
              }
              disabled={
                episodePage === 1 ||
                episodesLoading
              }
              className={`rounded-xl border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-30 sm:px-5 sm:py-3 sm:text-base ${
                darkMode
                  ? "border-white/10 bg-white/5 hover:border-pink-500"
                  : "border-gray-200 bg-white hover:border-pink-400"
              }`}
            >
              ← Previous
            </button>

            <span className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-bold text-white">
              {episodePage}
            </span>

            <button
              onClick={() =>
                loadEpisodes(
                  episodePage + 1
                )
              }
              disabled={
                !episodeHasNext ||
                episodesLoading
              }
              className={`rounded-xl border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-30 sm:px-5 sm:py-3 sm:text-base ${
                darkMode
                  ? "border-white/10 bg-white/5 hover:border-purple-500"
                  : "border-gray-200 bg-white hover:border-purple-400"
              }`}
            >
              Next →
            </button>

          </div>
        )}

      </section>

      {/* ========================================= */}
      {/* CHARACTERS */}
      {/* ========================================= */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">

        <div className="mb-8">

          <p className="text-sm font-bold uppercase tracking-widest text-purple-500">
            Cast
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            👤 Characters
          </h2>

          <p
            className={`mt-2 ${
              darkMode
                ? "text-gray-500"
                : "text-gray-600"
            }`}
          >
            Meet the characters from {title}
          </p>

        </div>

        {charactersLoading ? (
          <div className="py-16 text-center">
            <p className="animate-pulse text-lg font-bold text-purple-500">
              Loading characters...
            </p>
          </div>
        ) : characters.length === 0 ? (
          <div
            className={`rounded-2xl border p-12 text-center ${
              darkMode
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-gray-500">
              No character information available.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">

              {visibleCharacters.map(
                (item, index) => {

                  const character =
                    item.character;

                  if (!character) {
                    return null;
                  }

                  const characterImage =
                    character.images?.jpg
                      ?.large_image_url ||
                    character.images?.jpg
                      ?.image_url ||
                    "";

                  const voiceActor =
                    item.voice_actors?.find(
                      (voice) =>
                        voice.language ===
                        "English"
                    ) ||
                    item.voice_actors?.[0];

                  return (
                    <button
                      key={`${character.mal_id}-${index}`}
                      onClick={() =>
                        openCharacter(item)
                      }
                      className={`group overflow-hidden rounded-2xl border text-left transition duration-300 hover:-translate-y-2 ${
                        darkMode
                          ? "border-white/10 bg-white/5 hover:border-purple-500/50"
                          : "border-gray-200 bg-white shadow-sm hover:border-purple-400"
                      }`}
                    >

                      {/* CHARACTER IMAGE */}

                      <div className="relative h-56 overflow-hidden sm:h-64">

                        {characterImage ? (
                          <img
                            src={characterImage}
                            alt={
                              character.name
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">

                          <h3 className="font-bold text-white">
                            {character.name}
                          </h3>

                        </div>

                      </div>

                      {/* ROLE */}

                      <div className="p-4">

                        <p className="text-sm text-purple-500">
                          {item.role ||
                            "Character"}
                        </p>

                        {voiceActor?.person
                          ?.name && (
                          <p className="mt-2 truncate text-xs text-gray-500">
                            🎙️{" "}
                            {
                              voiceActor
                                .person
                                .name
                            }
                          </p>
                        )}

                      </div>

                    </button>
                  );
                }
              )}

            </div>

            {/* SEE MORE */}

            {characters.length > 12 && (
              <div className="mt-8 text-center">

                <button
                  onClick={() =>
                    setShowAllCharacters(
                      !showAllCharacters
                    )
                  }
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-7 py-3 font-bold text-white transition hover:scale-105"
                >
                  {showAllCharacters
                    ? "Show Less ↑"
                    : `See More Characters ↓`}
                </button>

              </div>
            )}

          </>
        )}

      </section>

      {/* ========================================= */}
      {/* CHARACTER MODAL */}
      {/* ========================================= */}

      {selectedCharacter && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-5"
          onClick={() =>
            setSelectedCharacter(null)
          }
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className={`relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border p-4 shadow-2xl sm:p-6 ${
              darkMode
                ? "border-white/10 bg-slate-900"
                : "border-gray-200 bg-white"
            }`}
          >

            {/* CLOSE */}

            <button
              onClick={() =>
                setSelectedCharacter(null)
              }
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-xl transition hover:bg-pink-500"
            >
              ×
            </button>

            {characterLoading ? (
              <div className="py-20 text-center">
                <p className="animate-pulse font-bold text-pink-500">
                  Loading character...
                </p>
              </div>
            ) : (
              <>
                <h2 className="pr-12 text-3xl font-black">
                  {selectedCharacter.character
                    ?.name ||
                    selectedCharacter.name ||
                    "Character"}
                </h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr]">

                  {/* IMAGE */}

                  <div>

                    {(selectedCharacter
                      .character
                      ?.images?.jpg
                      ?.large_image_url ||
                      selectedCharacter
                        .character
                        ?.images?.jpg
                        ?.image_url ||
                      selectedCharacter
                        .images?.jpg
                        ?.large_image_url) && (
                      <img
                        src={
                          selectedCharacter
                            .character
                            ?.images?.jpg
                            ?.large_image_url ||
                          selectedCharacter
                            .character
                            ?.images?.jpg
                            ?.image_url ||
                          selectedCharacter
                            .images?.jpg
                            ?.large_image_url
                        }
                        alt="Character"
                        className="h-56 w-full rounded-2xl object-cover sm:h-64"
                      />
                    )}

                  </div>

                  {/* INFO */}

                  <div>

                    <p className="text-lg font-bold text-purple-500">
                      {selectedCharacter.role ||
                        selectedCharacter
                          .character
                          ?.role ||
                        "Character"}
                    </p>

                    {selectedCharacter
                      .voice_actors
                      ?.length > 0 && (
                      <div className="mt-6">

                        <h3 className="text-lg font-black">
                          🎙️ Voice Actors
                        </h3>

                        <div className="mt-3 space-y-3">

                          {selectedCharacter.voice_actors
                            .slice(0, 5)
                            .map(
                              (
                                voice: any,
                                index: number
                              ) => (
                                <div
                                  key={
                                    index
                                  }
                                  className={`rounded-xl p-3 ${
                                    darkMode
                                      ? "bg-white/5"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <p className="font-semibold">
                                    {voice
                                      .person
                                      ?.name ||
                                      "Unknown"}
                                  </p>

                                  {voice.language && (
                                    <p className="text-xs text-gray-500">
                                      {
                                        voice.language
                                      }
                                    </p>
                                  )}
                                </div>
                              )
                            )}

                        </div>

                      </div>
                    )}

                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* FOOTER */}
      {/* ========================================= */}

      <footer
        className={`mt-10 border-t py-10 text-center ${
          darkMode
            ? "border-white/10 text-gray-500"
            : "border-gray-200 text-gray-500"
        }`}
      >
        <p>
          © 2026 Anime.Hub • Built for anime
          fans 🍥
        </p>
      </footer>

    </main>
  );
}

/* ============================================= */
/* INFO CARD */
/* ============================================= */

function InfoCard({
  label,
  value,
  darkMode,
}: {
  label: string;
  value: string | number;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        darkMode
          ? "border-white/10 bg-white/5"
          : "border-gray-200 bg-white shadow-sm"
      }`}
    >
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}