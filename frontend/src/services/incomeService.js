import api from "./api";
import { mapIncome } from "./mappers";

const toApiIncome = (data) => ({
  amount: Number(data.amount),
  description: data.description,
  date: data.date,
  source: data.source,
  categoryId:
    data.categoryId ??
    (data.category != null && data.category !== "" ? data.category : null),
  isRecurring: data.recurring ?? data.isRecurring ?? false,
  recurringFrequency: data.recurringFrequency || null,
});

const mapList = (res) =>
  Array.isArray(res.data.data) ? res.data.data.map(mapIncome) : [];

export const getIncomes = () => api.get("/income").then(mapList);

export const getIncome = (id) =>
  api.get(`/income/${id}`).then((res) => mapIncome(res.data.data));

export const createIncome = (data) =>
  api.post("/income", toApiIncome(data)).then((res) => mapIncome(res.data.data));

export const updateIncome = (id, data) =>
  api.put(`/income/${id}`, toApiIncome(data)).then((res) => mapIncome(res.data.data));

export const deleteIncome = (id) =>
  api.delete(`/income/${id}`).then((res) => res.data.data);

export const getIncomesByDateRange = (start, end) =>
  api
    .get("/income/range", { params: { start, end } })
    .then((res) => (Array.isArray(res.data.data) ? res.data.data.map(mapIncome) : []));
