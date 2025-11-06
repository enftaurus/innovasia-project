import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  withCredentials: true,
});

// Example endpoints
export const getResources = () => api.get("/resources");
export const postAppointment = (payload) => api.post("/appointments", payload);
export const postAssessment = (payload) => api.post("/assessments", payload);
export const chatReply = (payload) => {
  const url = import.meta.env.VITE_OPENAI_PROXY_URL || `${api.defaults.baseURL}/chat`;
  return axios.post(url, payload, { withCredentials: true });
};

export default api;
