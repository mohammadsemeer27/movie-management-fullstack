import { useState } from "react";
import {
  Film,
  Menu,
  X,
  LogIn,
  UserPlus,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();

    setProfileOpen(false);
    setMenuOpen(false);

    toast.success("Logged out successfully!");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
            <Film size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">
              MovieHub
            </h1>

            <p className="text-xs text-zinc-500">
              Movie Management
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-8 md:flex">

          <Link
            to="/"
            className="text-sm text-zinc-300 transition hover:text-white"
          >
            Movies
          </Link>

          {isAuthenticated && (
            <Link
              to="/profile"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Watch History
            </Link>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
            >
              <Shield size={15} />
              Admin
            </Link>
          )}

          <a
            href="#footer"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            About
          </a>

        </nav>

        {/* DESKTOP AUTH */}
        <div className="relative hidden items-center gap-3 md:flex">

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
              >
                <LogIn size={16} />
                Login
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                <UserPlus size={16} />
                Register
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition hover:bg-white/[0.07]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600">
                  <User size={15} />
                </div>

                <span>
                  {user?.name || "User"}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#18181b] shadow-2xl">

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5"
                  >
                    <User size={16} />
                    Profile
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5"
                    >
                      <Shield size={16} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                </div>
              )}
            </>
          )}

        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-zinc-300 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="border-t border-white/10 px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
            >
              Movies
            </Link>

            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
              >
                Watch History
              </Link>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-left text-red-400"
              >
                Logout
              </button>
            )}

          </div>
        </div>
      )}

    </header>
  );
}

export default Navbar;