import api from "./api";

export const getProfile = () =>
  api.get("/users/profile").then((res) => res.data.data);

export const updateProfile = (data) =>
  api.put("/users/profile", data).then((res) => res.data.data);

export const changePassword = (data) =>
  api.put("/users/change-password", data).then((res) => res.data.data);
