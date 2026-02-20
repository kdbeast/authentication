import axios from "axios";

const server = "http://localhost:8000";

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Trigger refresh on 401 (token expired) or 403 (no token / forbidden)
    // Skip if the failing request is the refresh call itself (avoid infinite loop)
    const isRefreshCall = originalRequest.url?.includes("/api/v1/refresh");
    if (
      (status === 401 || status === 403) &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // /refresh sets the new accessToken cookie in the response automatically
        await api.post("/api/v1/refresh");
        processQueue(null);
        // Re-fire original request — new cookie is already attached by the browser
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
