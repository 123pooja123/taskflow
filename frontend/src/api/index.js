// All API calls go through here — talks to the Express backend

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const token = () => localStorage.getItem("tf_token");

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token() && { Authorization: `Bearer ${token()}` })
    },
    ...(body && { body: JSON.stringify(body) })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

export const authAPI = {
  async register(name, email, password) {
    const data = await req("POST", "/api/auth/register", { name, email, password });
    localStorage.setItem("tf_token", data.token);
    localStorage.setItem("tf_user", JSON.stringify(data.user));
    return data.user;
  },
  async login(email, password) {
    const data = await req("POST", "/api/auth/login", { email, password });
    localStorage.setItem("tf_token", data.token);
    localStorage.setItem("tf_user", JSON.stringify(data.user));
    return data.user;
  },
  logout() {
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
  },
  getUser() {
    const u = localStorage.getItem("tf_user");
    return u ? JSON.parse(u) : null;
  }
};

export const tasksAPI = {
  getAll:   ()           => req("GET",    "/api/tasks"),
  create:   (data)       => req("POST",   "/api/tasks", data),
  update:   (id, data)   => req("PUT",    `/api/tasks/${id}`, data),
  delete:   (id)         => req("DELETE", `/api/tasks/${id}`)
};

export const aiAPI = {
  breakdown: (goal) => req("POST", "/api/ai/breakdown", { goal })
};
