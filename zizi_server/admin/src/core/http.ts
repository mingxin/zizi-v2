import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30000,
})

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('zizi_admin_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

http.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('zizi_admin_token')
      location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default http
