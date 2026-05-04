import { configureStore } from '@reduxjs/toolkit';
import { reducer } from './schemaSlice';
import { useDispatch, useSelector } from 'react-redux';

export const createStore = () => configureStore({
  reducer: {
    schema: reducer,
  },
});

export type Store = ReturnType<typeof createStore>;
export type RootState = ReturnType<Store['getState']>;
export type AppDispatch = Store['dispatch'];

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
