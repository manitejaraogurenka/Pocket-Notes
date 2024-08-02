import { createSlice } from "@reduxjs/toolkit";

const lightDarkSlice = createSlice({
  name: "lightDark",
  initialState: { isdark: false },
  reducers: {
    setDark(state) {
      state.isdark = !state.isdark;
    },
  },
});

export const lightDarkActions = lightDarkSlice.actions;
export default lightDarkSlice;
