import { createSlice } from "@reduxjs/toolkit";

const groupSlice = createSlice({
  name: "group",
  initialState: {
    search: "",
    searchResult: "",
    selectedGroup: "",
    groupsList: [],
    notesForSelectedGroup: [],
    selectedName: "",
    selectedColor: "",
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },
    setSearchResult(state, action) {
      state.searchResult = action.payload;
    },
    setSelectedGroup(state, action) {
      state.selectedGroup = action.payload;
    },
    setGroupsList(state, action) {
      state.groupsList = [...state.groupsList, ...action.payload];
    },
    setNotesForSelectedGroup(state, action) {
      state.notesForSelectedGroup = action.payload;
    },
    setSelectedName(state, action) {
      state.selectedName = action.payload;
    },
    setSelectedGroupColor(state, action) {
      state.selectedColor = action.payload;
    },
    addNoteToSelectedGroup(state, action) {
      state.notesForSelectedGroup.push(action.payload);
    },
    updateNoteInSelectedGroup(state, action) {
      const { id, content } = action.payload;
      const note = state.notesForSelectedGroup.find((note) => note._id === id);
      if (note) {
        note.content = content;
        note.updatedAt = new Date().toISOString();
      }
    },
    removeNoteFromSelectedGroup(state, action) {
      state.notesForSelectedGroup = state.notesForSelectedGroup.filter(
        (note) => note._id !== action.payload
      );
    },
  },
});

export const groupActions = groupSlice.actions;
export default groupSlice;
