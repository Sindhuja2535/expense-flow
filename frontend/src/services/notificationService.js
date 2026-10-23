import api from "./api";

export const getNotifications = () =>
  api.get("/notifications").then((res) => res.data.data);

export const markAsRead = (id) =>
  api.put(`/notifications/${id}/read`).then((res) => res.data.data);

export const markAllAsRead = () =>
  api.put("/notifications/read-all").then((res) => res.data.data);

export const getUnreadCount = () =>
  api.get("/notifications/unread-count").then((res) => res.data.data);
