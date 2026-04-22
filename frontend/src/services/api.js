import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
});

export async function fetchLocations() {
  const response = await api.get("/locations");
  return response.data;
}

export async function fetchLocationQueue(locationId) {
  const response = await api.get(`/queue/${locationId}`);
  return response.data;
}

export async function updateQueue(locationId, people) {
  const response = await api.post("/update", { locationId, people: Number(people) });
  return response.data;
}

export async function addLocation(locationData) {
  const response = await api.post("/add-location", locationData);
  return response.data;
}

export async function resetQueue(locationId) {
  const response = await api.post(`/reset/${locationId}`);
  return response.data;
}

export async function sendGpsCheckin(payload) {
  const response = await api.post("/gps-checkin", payload);
  return response.data;
}
