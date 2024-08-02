import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import groupSlice from "./group-slice";
import lightDarkSlice from "./lightDark";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  group: groupSlice.reducer,
  lightDark: lightDarkSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

let persistor = persistStore(store);

export { store, persistor };
