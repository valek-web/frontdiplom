import axios, { type AxiosResponse } from "axios"

const api = axios.create({
  baseURL: "https://api.studio-av.ru", // замените на ваш URL
  headers: { "Content-Type": "application/json" },
})

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.location.pathname = "/login"
    }
    return Promise.reject(error)
  },
)

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
