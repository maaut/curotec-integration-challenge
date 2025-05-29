import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to handle 401 errors (e.g., redirect to login)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token might be expired or invalid
      localStorage.removeItem("token");
      // Optionally, redirect to login page or dispatch a logout action
      // For example, using a global event bus or a callback passed to the interceptor
      console.error("Unauthorized, logging out.");
      // window.location.href = '/login'; // This can be abrupt, consider a more integrated solution
      // If using a state management solution that AuthContext can access (e.g. via custom event):
      // document.dispatchEvent(new Event('auth-token-expired'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
