import api from "./api";
import { mapExpense, joinTags } from "./mappers";

const toApiExpense = (data) => ({
  amount: Number(data.amount),
  description: data.description,
  date: data.date,
  categoryId:
    data.categoryId ??
    (data.category != null && data.category !== "" ? data.category : null),
  notes: data.notes || null,
  tags: joinTags(data.tags),
  isRecurring: data.recurring ?? data.isRecurring ?? false,
  recurringFrequency: data.recurringFrequency || null,
  receiptUrl: data.receiptUrl || null,
});

const mapList = (res) =>
  Array.isArray(res.data.data) ? res.data.data.map(mapExpense) : [];

export const getExpenses = () => api.get("/expenses").then(mapList);

export const getExpense = (id) =>
  api.get(`/expenses/${id}`).then((res) => mapExpense(res.data.data));

export const createExpense = (data) =>
  api.post("/expenses", toApiExpense(data)).then((res) => mapExpense(res.data.data));

export const updateExpense = (id, data) =>
  api.put(`/expenses/${id}`, toApiExpense(data)).then((res) => mapExpense(res.data.data));

export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`).then((res) => res.data.data);

export const getExpensesByDateRange = (start, end) =>
  api
    .get("/expenses/range", { params: { start, end } })
    .then((res) => (Array.isArray(res.data.data) ? res.data.data.map(mapExpense) : []));

export const exportExpensesCsv = () =>
  api.get("/expenses/export/csv", { responseType: "blob" }).then((res) => res.data);
