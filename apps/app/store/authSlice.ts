import { createSlice } from "@reduxjs/toolkit";
import { Session } from "next-auth";
import { HYDRATE } from "next-redux-wrapper";

export const AUTH_SLICE_NAME = "auth";

export interface AuthState {
    session?: Session;
}

const initialState: AuthState = {
    session: undefined,
}

export const authSlice = createSlice({
    name: AUTH_SLICE_NAME,
    initialState,
    reducers: {

        /**
         * Set current session in state
         * @param state Current state obj
         * @param action Action containing the payload
         */
        setSession: (state, action) => {
            state.session = action.payload;
        }

    },
    extraReducers: {
        [HYDRATE]: (state, action) => ({
            ...state,
            ...action.payload[AUTH_SLICE_NAME]
        })
    }
});

export const { setSession } = authSlice.actions;
export default authSlice;