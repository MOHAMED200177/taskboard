import { client } from "./client";

export const tasksApi = {
  list: (projectId, filters = {}) =>
    client
      .get(`/projects/${projectId}/tasks`, { params: filters })
      .then((r) => r.data),
  create: (projectId, payload) =>
    client.post(`/projects/${projectId}/tasks`, payload).then((r) => r.data),
  update: (projectId, taskId, payload) =>
    client
      .patch(`/projects/${projectId}/tasks/${taskId}`, payload)
      .then((r) => r.data),
  remove: (projectId, taskId) =>
    client.delete(`/projects/${projectId}/tasks/${taskId}`).then((r) => r.data),
};
