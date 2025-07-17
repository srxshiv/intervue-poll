import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  isOpen: false,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      if (!state.isOpen) {
        state.unreadCount++;
      }
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      if (state.isOpen) {
        state.unreadCount = 0;
      }
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const {
  setMessages,
  addMessage,
  toggleChat,
  clearUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;