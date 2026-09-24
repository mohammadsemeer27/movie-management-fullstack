import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Film,
  Plus,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import {
  getMovies,
  getAdminUsers,
  createMovie,
  deleteMovie,
} from "../api/api";
import ShowTimingManager from "../components/ShowTimingManager";

function Admin() {
  const { user, token } = useAuth();

  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [deleteMovieTarget, setDeleteMovieTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    language: "",
    duration: "",
  });

  useEffect(() => {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }

    loadAdminData();
  }, [user]);
async function loadAdminData() {
  try {
    setLoading(true);
    setError("");

    const [movieData, userData] = await Promise.all([
      getMovies(),
      getAdminUsers(token),
    ]);

    setMovies(Array.isArray(movieData) ? movieData : []);
setUsers(Array.isArray(userData) ? userData : []);
  } catch (error) {
    console.error("Admin data error:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleCreateMovie(e) {
    e.preventDefault();

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const newMovie = {
        title: formData.title,
        genre: formData.genre,
        language: formData.language,
        duration: Number(formData.duration),
      };

      await createMovie(newMovie, token);

      setFormData({
        title: "",
        genre: "",
        language: "",
        duration: "",
      });

      toast.success("Movie added successfully!");

      await loadAdminData();
    } catch (error) {
      console.error("Create movie error:", error);

      setError(error.message);
      toast.error(error.message || "Failed to add movie");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteMovie(id) {
    try {
      await deleteMovie(id, token);

      setMovies((prevMovies) =>
        prevMovies.filter((movie) => movie.id !== id)
      );

      setDeleteMovieTarget(null);

      toast.success("Movie deleted successfully!");
    } catch (error) {
      console.error("Delete movie error:", error);

      toast.error(error.message || "Failed to delete movie");
    }
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Shield className="mx-auto text-red-500" size={48} />

        <h1 className="mt-5 text-3xl font-bold">
          Login required
        </h1>

        <p className="mt-3 text-zinc-500">
          Please login to access the admin dashboard.
        </p>
      </main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Shield className="mx-auto text-red-500" size={48} />

        <h1 className="mt-5 text-3xl font-bold">
          Access denied
        </h1>

        <p className="mt-3 text-zinc-500">
          Admin access is required to view this page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">

      {/* HEADER */}
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600">
            <Shield size={24} />
          </div>

          <div>
            <p className="text-sm text-red-500">
              ADMIN PANEL
            </p>

            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>
          </div>
        </div>

        <p className="mt-4 text-zinc-500">
          Manage movies and users from one place.
        </p>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
          {message}
        </div>
      )}

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-zinc-500">
                Total Movies
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading ? "—" : movies.length}
              </p>
            </div>

            <div className="rounded-xl bg-red-500/10 p-3 text-red-500">
              <Film size={24} />
            </div>

          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-zinc-500">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading ? "—" : users.length}
              </p>
            </div>

            <div className="rounded-xl bg-red-500/10 p-3 text-red-500">
              <Users size={24} />
            </div>

          </div>
        </div>

      </section>

      {/* ADD MOVIE */}
      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
            <Plus size={20} />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Add New Movie
            </h2>

            <p className="text-sm text-zinc-500">
              Add a movie to the database.
            </p>
          </div>

        </div>

        <form
          onSubmit={handleCreateMovie}
          className="grid gap-4 sm:grid-cols-2"
        >

          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Movie title"
            required
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-red-500"
          />

          <input
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            placeholder="Genre"
            required
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-red-500"
          />

          <input
            name="language"
            value={formData.language}
            onChange={handleChange}
            placeholder="Language"
            required
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-red-500"
          />

          <input
            name="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Duration in minutes"
            required
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-red-500"
          />

          <button
            type="submit"
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-medium transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
          >
            {actionLoading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Movie
              </>
            )}
          </button>

        </form>
      </section>

      {/* SHOW TIMING */}
      <ShowTimingManager
        movies={movies}
        token={token}
      />

      {/* MOVIES */}
      <section className="mt-10">

        <div className="mb-5">
          <p className="text-sm font-medium text-red-500">
            DATABASE
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Movies
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <LoaderCircle
              className="mx-auto animate-spin text-red-500"
              size={32}
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px] text-left">

                <thead className="border-b border-white/10 bg-white/[0.03]">

                  <tr>

                    <th className="px-5 py-4 text-sm text-zinc-500">
                      ID
                    </th>

                    <th className="px-5 py-4 text-sm text-zinc-500">
                      Title
                    </th>

                    <th className="px-5 py-4 text-sm text-zinc-500">
                      Genre
                    </th>

                    <th className="px-5 py-4 text-sm text-zinc-500">
                      Language
                    </th>

                    <th className="px-5 py-4 text-sm text-zinc-500">
                      Duration
                    </th>

                    <th className="px-5 py-4 text-right text-sm text-zinc-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {movies.map((movie) => (
                    <tr
                      key={movie.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >

                      <td className="px-5 py-4 text-sm text-zinc-500">
                        #{movie.id}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {movie.title}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {movie.genre}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {movie.language}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {movie.duration} min
                      </td>

                      <td className="px-5 py-4 text-right">

                        <button
                          onClick={() => setDeleteMovieTarget(movie)}
                          className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </section>

      {/* USERS */}
      <section className="mt-10">

        <div className="mb-5">

          <p className="text-sm font-medium text-red-500">
            ACCOUNTS
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Users
          </h2>

        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {users.map((account) => (
            <div
              key={account.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="font-semibold">
                    {account.name}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {account.email}
                  </p>
                </div>

                <span className="rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-400">
                  {account.role}
                </span>

              </div>

              <p className="mt-4 text-xs text-zinc-600">
                User #{account.id}
              </p>

            </div>
          ))}

        </div>

      </section>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteMovieTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">

            <div className="mb-5 flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <Trash2 size={22} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Delete movie?
                </h3>

                <p className="text-sm text-zinc-500">
                  This action cannot be undone.
                </p>
              </div>

            </div>

            <p className="mb-6 text-sm leading-6 text-zinc-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                "{deleteMovieTarget.title}"
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setDeleteMovieTarget(null)}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDeleteMovie(deleteMovieTarget.id)}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete Movie
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default Admin;