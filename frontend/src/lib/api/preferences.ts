import api from "./client";

export async function getPreferences() {
  const res = await api.get("/users/me/preferences");
  return res.data;
}

export async function getPreference(key: string) {
  const res = await api.get(`/users/me/preferences/${key}`);
  return res.data;
}

export async function setPreference(key: string, value: any) {
  const res = await api.put(`/users/me/preferences/${key}`, { value });
  return res.data;
}