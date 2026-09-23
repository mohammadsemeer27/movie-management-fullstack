import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function App() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <footer
        id="footer"
        className="border-t border-white/10"
      >
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-zinc-500">
          © 2026 MovieHub · Movie Management System
        </div>
      </footer>
    </div>
  );
}

export default App;