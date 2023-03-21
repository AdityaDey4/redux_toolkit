import { createSlice } from "@reduxjs/toolkit";

const initialState = [
    {
        id : "0",
        name : "Aditya Dey"
    },
    {
        id : "1",
        name : "Rudra Mondal"
    },
    {
        id : "2",
        name : "Nandini Halder"
    }
]

const userSlice = createSlice({
    name : "users",
    initialState,
    reducers : {}
})

export const selectAllUsers = (state)=> state.users;

export default userSlice.reducer;