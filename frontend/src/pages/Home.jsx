import { useEffect, useState } from "react";
import {
  Search,
  Play,
  Clock,
  Film,
  RefreshCw,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMovies } from "../api/api";

function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMovies() {
    try {
      setLoading(true);
      setError("");

      const data = await getMovies();

      setMovies(data);
    } catch (error) {
      console.error("Failed to load movies:", error);
      setError(error.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovies();
  }, []);

  const filteredMovies = movies.filter((movie) =>
    `${movie.title} ${movie.genre} ${movie.language}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.18),transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-20">
          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              <Play size={14} fill="currentColor" />
              Explore Movies
            </div>

            <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Discover your next
              <span className="block text-red-500">
                favorite movie.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Browse movies, check show timings, and keep track of
              everything you've watched in one place.
            </p>

            {/* SEARCH */}
            <div className="relative mt-8 max-w-2xl">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                size={20}
              />

              <input
                type="text"
                placeholder="Search movies, genres or languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* MOVIES */}
      <main className="mx-auto max-w-7xl px-6 pb-20">

        <div className="mb-8 flex items-end justify-between">

          <div>
            <p className="text-sm font-medium text-red-500">
              COLLECTION
            </p>

            <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
              Popular Movies
            </h3>
          </div>

          {!loading && !error && (
            <p className="text-sm text-zinc-500">
              {filteredMovies.length}{" "}
              {filteredMovies.length === 1 ? "movie" : "movies"}
            </p>
          )}

        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-20 text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Loading movies...
            </p>

          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-10 text-center">

            <Film
              className="mx-auto text-red-500"
              size={40}
            />

            <h3 className="mt-4 text-lg font-semibold text-red-400">
              Failed to load movies
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadMovies}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium transition hover:bg-red-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>
        )}

        {/* NO RESULTS */}
        {!loading &&
          !error &&
          filteredMovies.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">

              <Film
                className="mx-auto text-zinc-600"
                size={40}
              />

              <h3 className="mt-4 text-lg font-semibold">
                No movies found
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                {search
                  ? `No movies match "${search}".`
                  : "There are no movies available right now."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/5"
                >
                  <X size={16} />
                  Clear Search
                </button>
              )}

            </div>
          )}

        {/* MOVIE GRID */}
        {!loading &&
          !error &&
          filteredMovies.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {filteredMovies.map((movie) => (
                <article
                  key={movie.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/20"
                >

                  {/* POSTER */}
                  <div className="relative flex aspect-[2/3] items-center justify-center overflow-hidden bg-zinc-900">

                    <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-zinc-900 to-black" />

                    <div className="relative text-center">
                      <Film
                        size={50}
                        className="mx-auto text-zinc-700"
                      />

                      <p className="mt-3 px-5 text-sm font-medium text-zinc-500">
                        {movie.title}
                      </p>
                    </div>

                    <div className="absolute left-3 top-3 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold">
                      🎬 Movie
                    </div>

                    <div className="absolute bottom-3 left-3 rounded-lg bg-red-600 px-2 py-1 text-xs font-medium">
                      {movie.language}
                    </div>

                  </div>

                  {/* INFO */}
                  <div className="p-4">

                    <h4 className="truncate text-lg font-semibold">
                      {movie.title}
                    </h4>

                    <p className="mt-1 truncate text-sm text-zinc-500">
                      {movie.genre}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">

                      <span>
                        {movie.duration} min
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {movie.language}
                      </span>

                    </div>

                    <Link
                      to={`/movies/${movie.id}`}
                      className="mt-4 block w-full rounded-xl bg-white/10 py-2.5 text-center text-sm font-medium transition hover:bg-red-600"
                    >
                      View Details
                    </Link>

                  </div>

                </article>
              ))}

            </div>
          )}

      </main>
    </>
  );
}

export default Home;