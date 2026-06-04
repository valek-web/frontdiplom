import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"
import { BrowserRouter } from "react-router"
import { ConfigProvider, theme } from "antd"
import { Provider } from "react-redux"
import { store } from "../shared/store/store"

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ConfigProvider
      theme={{ algorithm: theme.darkAlgorithm }}
      form={{
        requiredMark: false,
        validateMessages: {
          required: "Пожалуйста, введите ${label}",
          types: {
            email: "Введите корректный email адрес",
          },
          string: {
            min: "${label} должен содержать минимум ${min} символов",
            max: "${label} должен содержать максимум ${max} символов",
          },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </Provider>,
)
