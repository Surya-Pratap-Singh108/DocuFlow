import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

// Routes that should never trigger a token refresh attempt
const SKIP_REFRESH_ROUTES = [
    "/auth/login",
    "/auth/signup",
    "/auth/get-accessToken",
    "/auth/logout",
];

axiosInstance.interceptors.response.use(
    // Successful responses pass through unchanged
    (response) => response,

    // Handle errors
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors
        const is401 = error.response && error.response.status === 401;

        // Check if this request is an auth route we should skip
        const isSkippedRoute = SKIP_REFRESH_ROUTES.some((route) =>
            originalRequest.url.includes(route)
        );

        // If it's not a 401, or it's a skipped route, or we already retried once, reject
        if (!is401 || isSkippedRoute || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Mark this request so we don't retry it again
        originalRequest._retry = true;

        try {
            // Ask the server to issue a new access token using the refresh token cookie
            await axiosInstance.post("/auth/get-accessToken");

            // Retry the original request — the new access token cookie is sent automatically
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            // Refresh failed — reject with the original error
            return Promise.reject(error);
        }
    }
);