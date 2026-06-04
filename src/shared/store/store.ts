import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./reducers/authSlice"
import feedReducer from "./reducers/feedSlice"
import allowedEmailsReducer from "./reducers/allowedEmailsSlice"
import kanbanSlice from "./reducers/kanbanSlice"
import chatSlice from "./reducers/chatSlice"
import clientSlice from "./reducers/clientSlice"
import saleSlice from "./reducers/saleSlice"

export const store = configureStore({
  reducer: {
    feed: feedReducer,
    auth: authReducer,
    allowedEmails: allowedEmailsReducer,
    kanban: kanbanSlice,
    chat: chatSlice,
    client: clientSlice,
    sale: saleSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
