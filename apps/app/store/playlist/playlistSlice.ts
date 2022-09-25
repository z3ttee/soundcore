import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import { Playlist } from "../../features/playlist/entities/Playlist";

export const PLAYLIST_SLICE_NAME = "playlist";

export interface PlaylistState {
    list: Playlist[];
}

const initialState: PlaylistState = {
    list: []
}

export const playlistSlice = createSlice({
    name: PLAYLIST_SLICE_NAME,
    initialState,
    reducers: {

        setPlaylists: (state, action) => {
            state.list = action.payload;
        },

        addPlaylist: (state, action) => {
            const playlists = state.list || [];
            playlists.push(action.payload);

            state.list = playlists;
        },

        removePlaylist: (state, action) => {
            const playlists = state.list || [];
            const index = playlists.findIndex((playlist) => playlist.id === action.payload);
            if(index == -1) return;

            playlists.splice(index, 1);
            state.list = playlists;
        }

    },
    extraReducers: (builder) => {
        builder.addCase(HYDRATE, (state, action) => {
            return {
                ...state,
                ...action["payload"]?.[PLAYLIST_SLICE_NAME]
            }
        });
    }
});

export const { setPlaylists, addPlaylist, removePlaylist } = playlistSlice.actions;
export default playlistSlice;