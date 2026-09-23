const API_URL = "/api";

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data || "Registration failed");
  }

  return data;
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      message: text,
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Login failed"
    );
  }

  return data;
}

export async function getMovies() {
  const response = await fetch(`${API_URL}/movies`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch movies");
  }

  return data;
}

export async function getShowTimings(movieId) {
  const response = await fetch(
    `${API_URL}/movies/${movieId}/show-times`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch show timings"
    );
  }

  return data;
}

export async function markMovieAsWatched(movieId, token) {
  const response = await fetch(
    `${API_URL}/movies/${movieId}/watch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to mark movie as watched"
    );
  }

  return data;
}

export async function getWatchHistory(token) {
  const response = await fetch(
    `${API_URL}/users/me/watch-history`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch watch history"
    );
  }

  return data;
}


export async function getAdminUsers(token) {
  const response = await fetch(`${API_URL}/admin/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  return data;
}

export async function createMovie(movieData, token) {
  const response = await fetch(`${API_URL}/movies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movieData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create movie");
  }

  return data;
}

export async function deleteMovie(id, token) {
  const response = await fetch(`${API_URL}/movies/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      message: text,
    };
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete movie");
  }

  return data;
}


export async function createShowTiming(movieId, showTime, screen, token) {
  // Convert the browser's local date/time into UTC ISO format.
  const utcShowTime = new Date(showTime).toISOString();

  const response = await fetch(
    `${API_URL}/movies/${movieId}/show-times`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        show_time: utcShowTime,
        screen: screen,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create show timing"
    );
  }

  return data;
}