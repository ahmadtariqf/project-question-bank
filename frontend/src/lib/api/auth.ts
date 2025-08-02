import api from "./client";

export function login(email: string, password: string) {
  return api({
    url: "/auth/login",
    method: "POST",
    data: { email, password },
  });
}

export function signup(data: { email: string; password: string; name: string }) {
  return api({
    url: "/auth/signup",
    method: "POST",
    data,
  });
}