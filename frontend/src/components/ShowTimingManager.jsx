import { useState } from "react";
import {
  Clock3,
  Plus,
  LoaderCircle,
} from "lucide-react";

import toast from "react-hot-toast";
import { createShowTiming } from "../api/api";

function ShowTimingManager({ movies, token }) {
  const [movieId, setMovieId] = useState("");
  const [showTime, setShowTime] = useState("");
  const [screen, setScreen] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await createShowTiming(
        movieId,
        showTime,
        screen,
        token
      );

      toast.success("Show timing added successfully!");

      setMovieId("");
      setShowTime("");
      setScreen("");
    } catch (error) {
      console.error("Show timing error:", error);

      toast.error(
        error.message || "Failed to add show timing"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
          <Clock3 size={20} />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Add Show Timing
          </h2>

          <p className="text-sm text-zinc-500">
            Schedule a movie screening.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-3"
      >

        {/* MOVIE */}
        <select
          value={movieId}
          onChange={(e) => setMovieId(e.target.value)}
          required
          className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
        >
          <option value="" className="bg-zinc-900">
            Select movie
          </option>

          {movies.map((movie) => (
            <option
              key={movie.id}
              value={movie.id}
              className="bg-zinc-900"
            >
              {movie.title}
            </option>
          ))}
        </select>

        {/* DATE + TIME */}
        <input
          type="datetime-local"
          value={showTime}
          onChange={(e) => setShowTime(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          required
          className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
        />

        {/* SCREEN */}
        <input
          type="text"
          value={screen}
          onChange={(e) => setScreen(e.target.value)}
          placeholder="Screen 1"
          required
          className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-red-500"
        />

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-medium transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-3"
        >
          {loading ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
              Adding...
            </>
          ) : (
            <>
              <Plus size={18} />
              Add Show Timing
            </>
          )}
        </button>

      </form>
    </section>
  );
}

export default ShowTimingManager;