import { client } from './client';

export const projectsApi = {
  list: () => client.get('/projects').then((r) => r.data),
  get: (id) => client.get(`/projects/${id}`).then((r) => r.data),
  create: (payload) => client.post('/projects', payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/projects/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/projects/${id}`).then((r) => r.data),
  addMember: (id, userId) => client.post(`/projects/${id}/members`, { userId }).then((r) => r.data),
  removeMember: (id, userId) => client.delete(`/projects/${id}/members/${userId}`).then((r) => r.data),
};
