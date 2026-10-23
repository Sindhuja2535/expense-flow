import api from "./api";

export const getBudgets = () =>
  api.get("/budgets").then((res) => res.data.data);

export const getBudget = (id) =>
  api.get(`/budgets/${id}`).then((res) => res.data.data);

export const createBudget = (data) =>
  api.post("/budgets", data).then((res) => res.data.data);

export const updateBudget = (id, data) =>
  api.put(`/budgets/${id}`, data).then((res) => res.data.data);

export const deleteBudget = (id) =>
  api.delete(`/budgets/${id}`).then((res) => res.data.data);

export const getBudgetProgress = () =>
  api.get("/budgets/progress").then((res) => res.data.data);
