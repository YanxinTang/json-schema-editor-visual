import { configureStore } from '@reduxjs/toolkit';
import { schemaSlice } from './schemaSlice';

export default configureStore({
  reducer: {
    schema: schemaSlice.reducer,
  },
});
