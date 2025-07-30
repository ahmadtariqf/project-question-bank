import axios from "axios";
import { getAccessToken, setAccessToken } from "./auth";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,            // send/receive HTTP‑only cookies
});

// Attach access token on each request
api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh on 401 once per request
api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      // call refresh endpoint (no body)
      const { data } = await api.post("/auth/refresh");
      setAccessToken(data.access_token);
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return api(original);
    }
    return Promise.reject(err);
  }
);

export default api;
