import express from 'express';
import https from 'https';
import fs from 'fs';
import {Server} from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';


const app = express();
const options = {
  key: fs.readFileSync('./server/key.pem'),
  cert: fs.readFileSync('./server/cert.pem')
};
const server = https.createServer(options, app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


app.use(cors());
app.use(express.json());

let currentPoll = null;
let students = new Map();
let pollHistory = [];
let chatMessages = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('teacher-login', () => {
    socket.join('teachers');
    socket.emit('current-poll', currentPoll);
    socket.emit('students-list', Array.from(students.values()));
    socket.emit('poll-history', pollHistory);
    socket.emit('chat-messages', chatMessages);
  });

  socket.on('student-login', (data) => {
    const { name, studentId } = data;
    
    if (!studentId) {
      const newStudentId = uuidv4();
      students.set(newStudentId, {
        id: newStudentId,
        name,
        socketId: socket.id,
        hasAnswered: false,
        answer: null,
        joinedAt: new Date()
      });
      
      socket.join('students');
      socket.emit('student-registered', { studentId: newStudentId, name });
      socket.emit('students-list', Array.from(students.values()));
      
      if (currentPoll) {
        socket.emit('current-poll', currentPoll);
      }
      
      io.to('teachers').emit('student-joined', students.get(newStudentId));
      io.to('teachers').emit('students-list', Array.from(students.values()));
      io.to('students').emit('students-list', Array.from(students.values()));
    } else {
      if (students.has(studentId)) {
        const student = students.get(studentId);
        student.socketId = socket.id;
        students.set(studentId, student);
        
        socket.join('students');
        socket.emit('student-registered', { studentId, name: student.name });
        socket.emit('students-list', Array.from(students.values()));
        
        if (currentPoll) {
          socket.emit('current-poll', currentPoll);
          if (currentPoll.status === 'active') {
            socket.emit('poll-results', getPollResults());
          }
        }
      }
    }
  });

  socket.on('create-poll', (pollData) => {
    if (currentPoll && currentPoll.status === 'active') {
      socket.emit('error', 'A poll is already active');
      return;
    }

    currentPoll = {
      id: uuidv4(),
      question: pollData.question,
      options: pollData.options,
      maxTime: pollData.maxTime,
      correctAnswer: pollData.correctAnswer || null,
      status: 'active',
      createdAt: new Date(),
      responses: new Map(),
      timeLeft: pollData.maxTime
    };

    students.forEach((student, id) => {
      student.hasAnswered = false;
      student.answer = null;
      students.set(id, student);
    });

    io.emit('current-poll', currentPoll);
    io.to('teachers').emit('students-list', Array.from(students.values()));

    const countdown = setInterval(() => {
      if (currentPoll && currentPoll.status === 'active') {
        currentPoll.timeLeft--;
        io.emit('poll-time-update', currentPoll.timeLeft);
        
        if (currentPoll.timeLeft <= 0) {
          endPoll();
          clearInterval(countdown);
        }
      } else {
        clearInterval(countdown);
      }
    }, 1000);
  });

  socket.on('submit-answer', (data) => {
    const { studentId, answer } = data;
    
    if (!currentPoll || currentPoll.status !== 'active') {
      socket.emit('error', 'No active poll');
      return;
    }

    if (students.has(studentId)) {
      const student = students.get(studentId);
      student.hasAnswered = true;
      student.answer = answer;
      students.set(studentId, student);

      currentPoll.responses.set(studentId, answer);
      
      io.emit('poll-results', getPollResults());
      io.to('teachers').emit('students-list', Array.from(students.values()));
      io.to('students').emit('students-list', Array.from(students.values()));

      const allAnswered = Array.from(students.values()).every(s => s.hasAnswered);
      if (allAnswered) {
        endPoll();
      }
    }
  });

  socket.on('end-poll', () => {
    endPoll();
  });

  socket.on('kick-student', (studentId) => {
    if (students.has(studentId)) {
      const student = students.get(studentId);
      io.to(student.socketId).emit('kicked');
      students.delete(studentId);
      io.to('teachers').emit('students-list', Array.from(students.values()));
      io.to('students').emit('students-list', Array.from(students.values()));
    }
  });

  socket.on('send-message', (data) => {
    const { message, sender, senderType } = data;
    const chatMessage = {
      id: uuidv4(),
      message,
      sender,
      senderType,
      timestamp: new Date()
    };
    
    chatMessages.push(chatMessage);
    io.emit('chat-message', chatMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    students.forEach((student, id) => {
      if (student.socketId === socket.id) {
        student.socketId = null;
        students.set(id, student);
      }
    });
  });

  function endPoll() {
    if (currentPoll) {
      currentPoll.status = 'ended';
      currentPoll.endedAt = new Date();
      
      if (currentPoll.correctAnswer) {
        students.forEach((student, studentId) => {
          if (student.socketId && student.hasAnswered) {
            const isCorrect = student.answer === currentPoll.correctAnswer;
            io.to(student.socketId).emit('student-result', {
              isCorrect,
              studentAnswer: student.answer,
              correctAnswer: currentPoll.correctAnswer
            });
          }
        });
      }
      
      pollHistory.push({
        ...currentPoll,
        responses: Array.from(currentPoll.responses.entries()),
        students: Array.from(students.values()).map(s => ({
          name: s.name,
          hasAnswered: s.hasAnswered,
          answer: s.answer
        }))
      });

      io.emit('poll-ended', currentPoll);
      io.to('teachers').emit('poll-history', pollHistory);
    }
  }

  function getPollResults() {
    if (!currentPoll) return null;
    
    const results = {};
    currentPoll.options.forEach(option => {
      results[option] = 0;
    });
    
    currentPoll.responses.forEach(answer => {
      if (results.hasOwnProperty(answer)) {
        results[answer]++;
      }
    });
    
    return {
      results,
      totalResponses: currentPoll.responses.size,
      totalStudents: students.size
    };
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});