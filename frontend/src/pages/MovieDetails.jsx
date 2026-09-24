import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Globe,
  Film,
  LogIn,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getMovie,
  getShowTimings,
  markMovieAsWatched,
} from "../api/api";

import { useAuth } from "../context/AuthContext";

function MovieDetails() {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [showTimings, setShowTimings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timingsLoading, setTimingsLoading] = useState(true);
  const [error, setError] = useState("");
  const [timingsError, setTimingsError] = useState("");

  const [watching, setWatching] = useState(false);

  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);
        setError("");

        const data = await getMovie(id);

        setMovie(data);
      } catch (error) {
        console.error("Movie loading error:", error);

        setMovie(null);
        setError(error.message || "Failed to load movie");
      } finally {
        setLoading(false);
      }
    }

    async function loadShowTimings() {
      try {
        setTimingsLoading(true);
        setTimingsError("");

        const data = await getShowTimings(id);

        setShowTimings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Show timings error:", error);

        setShowTimings([]);
        setTimingsError(
          error.message || "Failed to load show timings"
        );
      } finally {
        setTimingsLoading(false);
      }
    }

    loadMovie();
    loadShowTimings();
  }, [id]);

  async function handleMarkAsWatched() {
    if (!isAuthenticated) {
      toast.error("Please login to mark movies as watched.");
      return;
    }

    try {
      setWatching(true);

      await markMovieAsWatched(id, token);

      toast.success("Movie marked as watched!");
    } catch (error) {
      console.error("Watch movie error:", error);

      toast.error(
        error.message || "Failed to mark movie as watched"
      );
    } finally {
      setWatching(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />

        <p className="mt-4 text-sm text-zinc-500">
          Loading movie...
        </p>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Film
          className="mx-auto text-red-500"
          size={45}
        />

        <h2 className="mt-5 text-3xl font-bold">
          Movie not found
        </h2>

        <p className="mt-3 text-zinc-500">
          {error || "The movie could not be found."}
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-3 text-sm transition hover:bg-red-700"
        >
          Back to Movies
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">

      {/* BACK */}
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Movies
      </Link>

      <div className="grid gap-10 md:grid-cols-[320px_1fr]">

        {/* POSTER */}
        <div className="flex aspect-[2/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/40 via-zinc-900 to-black">
          <div className="text-center">
            <Film
              size={65}
              className="mx-auto text-zinc-700"
            />

            <p className="mt-4 px-8 text-lg font-semibold text-zinc-500">
              {movie.title}
            </p>
          </div>
        </div>

        {/* MOVIE INFO */}
        <div>

          {/* GENRE + LANGUAGE */}
          <div className="mb-4 flex flex-wrap items-center gap-2">

            {movie.genre && (
              <span className="rounded-lg bg-red-600 px-3 py-1 text-xs">
                {movie.genre}
              </span>
            )}

            {movie.language && (
              <span className="text-sm text-zinc-500">
                {movie.language}
              </span>
            )}

          </div>

          {/* TITLE */}
          <h1 className="text-4xl font-bold sm:text-5xl">
            {movie.title}
          </h1>

          <p className="mt-6 leading-7 text-zinc-400">
            Enjoy {movie.title} on MovieHub. Check the available
            show timings and keep track of your watch history.
          </p>

          {/* INFO CARDS */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">

            <Info
              icon={<Calendar size={17} />}
              label="Movie ID"
              value={movie.id}
            />

            <Info
              icon={<Clock size={17} />}
              label="Duration"
              value={`${movie.duration} min`}
            />

            <Info
              icon={<Globe size={17} />}
              label="Language"
              value={movie.language || "N/A"}
            />

          </div>

          {/* SHOW TIMINGS */}
          <div className="mt-10">

            <h2 className="text-xl font-bold">
              Show Timings
            </h2>

            {/* LOADING */}
            {timingsLoading && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-zinc-500">
                  Loading show timings...
                </p>
              </div>
            )}

            {/* ERROR */}
            {!timingsLoading && timingsError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {timingsError}
              </div>
            )}

            {/* NO SHOW TIMINGS */}
            {!timingsLoading &&
              !timingsError &&
              showTimings.length === 0 && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm text-zinc-500">
                    No show timings available for this movie.
                  </p>
                </div>
              )}

            {/* SHOW TIMINGS LIST */}
            {!timingsLoading &&
              !timingsError &&
              showTimings.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  {showTimings.map((show) => (
                    <div
                      key={show.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-red-500/40"
                    >

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="font-semibold">
                            {formatShowTime(show.show_time)}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {formatShowDate(show.show_time)}
                          </p>
                        </div>

                        <span className="rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-400">
                          {show.screen}
                        </span>

                      </div>

                    </div>
                  ))}

                </div>
              )}

          </div>

          {/* WATCH BUTTON */}
          <div className="mt-8">

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleMarkAsWatched}
                disabled={watching}
                className="rounded-xl bg-red-600 px-8 py-3 font-medium transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {watching
                  ? "Saving..."
                  : "Mark as Watched"}
              </button>
            ) : (
              <div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-3 font-medium transition hover:bg-red-700"
                >
                  <LogIn size={17} />
                  Login to Mark as Watched
                </Link>

                <p className="mt-3 text-sm text-zinc-500">
                  Login to save this movie to your watch history.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <div className="flex items-center gap-2 text-red-500">
        {icon}

        <span className="text-xs text-zinc-500">
          {label}
        </span>
      </div>

      <p className="mt-2 font-semibold">
        {value}
      </p>

    </div>
  );
}

function formatShowTime(value) {
  const date = new Date(value);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShowDate(value) {
  const date = new Date(value);

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default MovieDetails;