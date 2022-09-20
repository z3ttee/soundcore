import { createSlice } from "@reduxjs/toolkit";
import { Session } from "next-auth";
import { HYDRATE } from "next-redux-wrapper";
import { AppState } from "./store";

export interface AuthState {
    authenticated: boolean;
    session?: Session;
}

const initialState: AuthState = {
    authenticated: false,
    session: undefined,
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

        /**
         * Change the authenticated state
         * @param state Current state obj
         * @param action Action containing the payload
         */
        setAuthenticated: (state, action) => {
            state.authenticated = action.payload;
        },

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
            ...action.payload.authState
        })
    }
});

export const { setAuthenticated, setSession } = authSlice.actions;
export const selectAuthState = (state: AppState) => state.auth.authenticated;
export default authSlice;