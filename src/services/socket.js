import io from 'socket.io-client';
import { store } from '../store/store';
import {
  setCurrentPoll,
  setPollHistory,
  setPollResults,
  updateTimeLeft,
  setStudents,
  addStudent,
  endPoll,
} from '../store/pollSlice';
import {
  setStudentInfo,
  setIsKicked,
} from '../store/studentSlice';
import {
  setMessages,
  addMessage,
} from '../store/chatSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('current-poll', (poll) => {
      store.dispatch(setCurrentPoll(poll));
    });

    this.socket.on('poll-history', (history) => {
      store.dispatch(setPollHistory(history));
    });

    this.socket.on('poll-results', (results) => {
      store.dispatch(setPollResults(results));
    });

    this.socket.on('poll-time-update', (timeLeft) => {
      store.dispatch(updateTimeLeft(timeLeft));
    });

    this.socket.on('poll-ended', () => {
      store.dispatch(endPoll());
    });

    this.socket.on('students-list', (students) => {
      store.dispatch(setStudents(students));
    });

    this.socket.on('student-joined', (student) => {
      store.dispatch(addStudent(student));
    });

    this.socket.on('student-registered', (data) => {
      store.dispatch(setStudentInfo(data));
    });

    this.socket.on('kicked', () => {
      store.dispatch(setIsKicked(true));
    });

    this.socket.on('chat-messages', (messages) => {
      store.dispatch(setMessages(messages));
    });

    this.socket.on('chat-message', (message) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on('student-result', (result) => {
      store.dispatch({ type: 'poll/setStudentResult', payload: result });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  teacherLogin() {
    this.socket.emit('teacher-login');
  }

  createPoll(pollData) {
    this.socket.emit('create-poll', pollData);
  }

  endPoll() {
    this.socket.emit('end-poll');
  }

  setCorrectAnswer(correctAnswer) {
    this.socket.emit('set-correct-answer', correctAnswer);
  }

  kickStudent(studentId) {
    this.socket.emit('kick-student', studentId);
  }

  studentLogin(name, studentId) {
    this.socket.emit('student-login', { name, studentId });
  }

  submitAnswer(studentId, answer) {
    this.socket.emit('submit-answer', { studentId, answer });
  }

  sendMessage(message, sender, senderType) {
    this.socket.emit('send-message', { message, sender, senderType });
  }
}

export default new SocketService();