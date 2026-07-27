import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { productsApi } from '../services/product/product.service';
import { categoriesApi } from '../services/category/category.service';
import { tokenizationApi } from '../services/gateway/tokenizationCard.service';
import { customersApi } from '../services/customer/customer.service';
import { setupListeners } from '@reduxjs/toolkit/query';
import checkoutReducer from './checkoutSlice';

// Storage inline — evita problemas de resolución de módulos con Vite + ESM
const webStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) =>
    Promise.resolve(void localStorage.setItem(key, value)),
  removeItem: (key: string) =>
    Promise.resolve(void localStorage.removeItem(key)),
};

const rootReducer = combineReducers({
    checkout: checkoutReducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [tokenizationApi.reducerPath]: tokenizationApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [tokenizationApi.reducerPath]: tokenizationApi.reducer,
});

const persistConfig = {
  key: 'checkout-app',
  version: 1,
  storage: webStorage,
  blacklist: ['checkout'], // datos de checkout no se persisten por seguridad
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(productsApi.middleware, categoriesApi.middleware, tokenizationApi.middleware, customersApi.middleware),
})

export const persistor = persistStore(store);

setupListeners(store.dispatch);


export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

