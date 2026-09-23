import { useEffect, useState } from "react";
import {
  User,
  Film,
  Clock,
  Calendar,
  LoaderCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getWatchHistory } from "../api/api";

function Profile() {
  const { user, token } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getWatchHistory(token);

      setHistory(data);
    } catch (error) {
      console.error("Watch history error:", error);
      setError(error.message || "Failed to load watch history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [token]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">

      {/* PROFILE HEADER */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-600">
            <User size={30} />
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Your Profile
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              {user?.name || "User"}
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              {user?.email}
            </p>

            {user?.role && (
              <span className="mt-3 inline-block rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-400">
                {user.role}
              </span>
            )}
          </div>

        </div>
      </section>

      {/* WATCH HISTORY */}
      <section className="mt-10">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-medium text-red-500">
              ACTIVITY
            </p>

            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Watch History
            </h2>
          </div>

          {!loading && !error && (
            <p className="text-sm text-zinc-500">
              {history.length}{" "}
              {history.length === 1 ? "movie" : "movies"} watched
            </p>
          )}

        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">

            <LoaderCircle
              className="mx-auto animate-spin text-red-500"
              size={35}
            />

            <p className="mt-4 text-sm text-zinc-500">
              Loading your watch history...
            </p>

          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">

            <Film
              className="mx-auto text-red-500"
              size={40}
            />

            <h3 className="mt-4 font-semibold text-red-400">
              Failed to load watch history
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadHistory}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium transition hover:bg-red-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && history.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">

            <Film
              className="mx-auto text-zinc-700"
              size={50}
            />

            <h3 className="mt-5 text-lg font-semibold">
              No watch history yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Movies you mark as watched will appear here.
              Start exploring the MovieHub collection.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium transition hover:bg-red-700"
            >
              Browse Movies
              <ArrowRight size={16} />
            </Link>

          </div>
        )}

        {/* HISTORY LIST */}
        {!loading && !error && history.length > 0 && (
          <div className="grid gap-4">

            {history.map((movie, index) => (
              <article
                key={`${movie.movie_id}-${movie.watched_at}-${index}`}
                className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 sm:flex-row sm:items-center"
              >

                {/* MOVIE ICON */}
                <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-950/50 via-zinc-900 to-black">
                  <Film
                    size={30}
                    className="text-zinc-600"
                  />
                </div>

                {/* MOVIE DETAILS */}
                <div className="flex-1">

                  <h3 className="text-lg font-semibold">
                    {movie.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-500">

                    {movie.genre && (
                      <span>
                        {movie.genre}
                      </span>
                    )}

                    {movie.language && (
                      <span>
                        {movie.language}
                      </span>
                    )}

                    {movie.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {movie.duration} min
                      </span>
                    )}

                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">

                    <Calendar size={14} />

                    Watched{" "}
                    {formatWatchedDate(movie.watched_at)}

                  </div>

                </div>

                {/* MOVIE ID */}
                <div className="self-start rounded-lg bg-white/5 px-3 py-2 text-xs text-zinc-500 sm:self-auto">
                  Movie #{movie.movie_id}
                </div>

              </article>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}

function formatWatchedDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default Profile;