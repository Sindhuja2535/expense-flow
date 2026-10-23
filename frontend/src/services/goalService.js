import api from "./api";

export const getGoals = () =>
  api.get("/goals").then((res) => res.data.data);

export const getGoal = (id) =>
  api.get(`/goals/${id}`).then((res) => res.data.data);

export const createGoal = (data) =>
  api.post("/goals", data).then((res) => res.data.data);

export const updateGoal = (id, data) =>
  api.put(`/goals/${id}`, data).then((res) => res.data.data);

export const deleteGoal = (id) =>
  api.delete(`/goals/${id}`).then((res) => res.data.data);

export const updateProgress = (id, amount) =>
  api.put(`/goals/${id}/progress`, { amount }).then((res) => res.data.data);
