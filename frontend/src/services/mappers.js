export const splitTags = (tags) =>
  Array.isArray(tags)
    ? tags
    : tags
      ? String(tags).split(",").map((t) => t.trim()).filter(Boolean)
      : [];

export const joinTags = (tags) =>
  Array.isArray(tags) ? tags.join(",") : tags || null;

export const mapExpense = (e = {}) => ({
  id: e.id,
  amount: Number(e.amount) || 0,
  description: e.description,
  date: e.date,
  notes: e.notes,
  tags: splitTags(e.tags),
  category: e.categoryName,
  categoryName: e.categoryName,
  categoryId: e.categoryId,
  recurring: !!e.isRecurring,
  isRecurring: !!e.isRecurring,
  receiptUrl: e.receiptUrl,
});

export const mapIncome = (e = {}) => ({
  id: e.id,
  amount: Number(e.amount) || 0,
  description: e.description,
  date: e.date,
  source: e.source,
  category: e.categoryName,
  categoryName: e.categoryName,
  categoryId: e.categoryId,
  recurring: !!e.isRecurring,
  isRecurring: !!e.isRecurring,
});
