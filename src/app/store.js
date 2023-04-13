import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../features/api/apiSlice";

export const store = configureStore({
    reducer : {
        [apiSlice.reducerPath] : apiSlice.reducer
    },

    // as we use rtk-query, we need to use some middleware
    middleware : getDefaultMiddleware=>
        getDefaultMiddleware().concat(apiSlice.middleware),

    devTools : true
})