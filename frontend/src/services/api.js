import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  r => r,
  err => Promise.reject(new Error(err.response?.data?.error || err.message))
);

export const getAppointments   = async (f = {}) => {
  const params = {};
  if (f.search)                    params.search  = f.search;
  if (f.status && f.status !== 'todos')   params.status  = f.status;
  if (f.date)                      params.date    = f.date;
  if (f.encaixe && f.encaixe !== 'todos') params.encaixe = f.encaixe === 'sim' ? 1 : 0;
  const { data } = await api.get('/appointments', { params });
  return data;
};

export const getStats           = async () => (await api.get('/appointments/stats')).data;

export const getTomorrowAppointments = async () =>
  (await api.get('/appointments/tomorrow')).data;

export const createAppointment  = async (a)    => (await api.post('/appointments', a)).data;
export const updateAppointment  = async (id,a) => (await api.put(`/appointments/${id}`, a)).data;
export const updateStatus       = async (id,s) => (await api.patch(`/appointments/${id}/status`, { status: s })).data;
export const updateConfirmacao  = async (id,c) => (await api.patch(`/appointments/${id}/confirmacao`, { confirmacao: c })).data;
export const deleteAppointment  = async (id)   => (await api.delete(`/appointments/${id}`)).data;
