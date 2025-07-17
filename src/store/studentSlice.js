import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  studentId: sessionStorage.getItem('studentId') || null,
  name: sessionStorage.getItem('studentName') || null,
  isRegistered: false,
  hasAnswered: false,
  isKicked: false,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudentInfo: (state, action) => {
      state.studentId = action.payload.studentId;
      state.name = action.payload.name;
      state.isRegistered = true;
      sessionStorage.setItem('studentId', action.payload.studentId);
      sessionStorage.setItem('studentName', action.payload.name);
    },
    setHasAnswered: (state, action) => {
      state.hasAnswered = action.payload;
    },
    setIsKicked: (state, action) => {
      state.isKicked = action.payload;
    },
    clearStudentInfo: (state) => {
      state.studentId = null;
      state.name = null;
      state.isRegistered = false;
      state.hasAnswered = false;
      state.isKicked = false;
      sessionStorage.removeItem('studentId');
      sessionStorage.removeItem('studentName');
    },
  },
});

export const {
  setStudentInfo,
  setHasAnswered,
  setIsKicked,
  clearStudentInfo,
} = studentSlice.actions;

export default studentSlice.reducer;