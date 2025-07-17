import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  pollHistory: [],
  pollResults: null,
  timeLeft: 0,
  students: [],
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setCurrentPoll: (state, action) => {
      state.currentPoll = action.payload;
      if (action.payload) {
        state.timeLeft = action.payload.timeLeft || action.payload.maxTime;
      }
    },
    setPollHistory: (state, action) => {
      state.pollHistory = action.payload;
    },
    setPollResults: (state, action) => {
      state.pollResults = action.payload;
    },
    updateTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    setStudents: (state, action) => {
      state.students = action.payload;
    },
    addStudent: (state, action) => {
      state.students.push(action.payload);
    },
    removeStudent: (state, action) => {
      state.students = state.students.filter(s => s.id !== action.payload);
    },
    endPoll: (state) => {
      if (state.currentPoll) {
        state.currentPoll.status = 'ended';
      }
    },
    setStudentResult: (state, action) => {
      state.studentResult = action.payload;
    },
    clearStudentResult: (state) => {
      state.studentResult = null;
    },
  },
  clearStudentResult: (state) => {
    state.studentResult = null;
  },
});

export const {
  setCurrentPoll,
  setPollHistory,
  setPollResults,
  updateTimeLeft,
  setStudents,
  addStudent,
  removeStudent,
  endPoll,
  setStudentResult,
  clearStudentResult,
} = pollSlice.actions;

export default pollSlice.reducer;