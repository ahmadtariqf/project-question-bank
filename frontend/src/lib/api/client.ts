import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../auth";
import { setRefreshLoading } from "./refreshLoading";
import { showGlobalError } from "./showGlobalError";
import { setGlobalLoadingState } from "./globalLoading"; // <-- add this import
import { showGlobalSuccess } from "./showGlobalSuccess";

// Create an Axios instance with a base URL and credentials
// This allows you to make API calls to your backend server
// The `withCredentials: true` option is used to include cookies in requests
// This is useful for session management, especially if you're using cookies for authentication.
// Note: Ensure your backend is configured to handle CORS properly if you're making cross-origin requests
// and that it allows credentials to be sent.
// The base URL should match your backend API endpoint.
// Adjust the base URL as needed for your environment (e.g., development, production).
const api = axios.create({ 
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_PREFIX}`,
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = getAccessToken(); // Retrieve the access token from memory
  if (token && config.headers) { 
    config.headers.Authorization = `Bearer ${token}`; // Set the Authorization header
  }
  setGlobalLoadingState(true); // <-- set loading true on request
  return config; 
});


api.interceptors.response.use(
  r => {
    setGlobalLoadingState(false); // <-- set loading false on response
    return r;
  },
  async err => {
    setGlobalLoadingState(false); // <-- set loading false on error
    const original = err.config;
    // Prevent infinite loop: do not handle 401 for refresh or logout endpoints
    const isRefresh = original.url.endsWith("/auth/refresh");
    const isLogout = original.url.endsWith("/auth/logout");
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !isRefresh &&
      !isLogout
    ) {
      original._retry = true;
      setRefreshLoading(true);
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        setRefreshLoading(false);
        return api(original);
      } catch (refreshError) {
        setRefreshLoading(false);
        await api.post("/auth/logout");
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);

api.interceptors.response.use(
  r => {
    if (r.data?.message) {
      showGlobalSuccess(r.data.message);
    }
    setGlobalLoadingState(false);
    return r;
  },
  err => {
    setGlobalLoadingState(false);
    showGlobalError(err.response?.data || "An error occurred");
    return Promise.reject(err);
  }
);

export default api;