import api from "./api";

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((res) => res.data.data);

export const register = (data) =>
  api.post("/auth/register", data).then((res) => res.data.data);
