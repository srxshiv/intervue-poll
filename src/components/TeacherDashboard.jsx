import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socket';
import CreatePoll from './CreatePoll';
import PollResults from './PollResults';
import PollHistory from './PollHistory';
import Chat from './Chat';

const TeacherDashboard = () => {
  const { currentPoll, students } = useSelector(state => state.poll);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    socketService.teacherLogin();
  }, []);

  const canCreateNewPoll = !currentPoll || currentPoll.status === 'ended';
  const allStudentsAnswered = students.every(student => student.hasAnswered);

  return (
    <div className="p-8 bg-white min-h-screen max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full">
          ✨ Intervue Poll
        </span>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-purple-600 border border-purple-500 rounded-full px-3 py-1 hover:bg-purple-50"
        >
          {showHistory ? 'Create Poll' : 'View Poll History'}
        </button>
      </div>

      {showHistory ? (
        <div className="p-4 rounded-md">
          <PollHistory />
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-1">
            Let’s <span className="text-black">Get Started</span>
          </h1>
          <p className="text-gray-500 mb-6">
            you’ll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>

          <div className="space-y-6">
  <div className="p-4 rounded-md">
    {canCreateNewPoll ? (
      <CreatePoll />
    ) : (
      <>
        <PollResults />
        {currentPoll.status === 'active' && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {allStudentsAnswered ? 'All students have answered' : 'Waiting for student responses...'}
            </span>
            <button
              onClick={() => socketService.endPoll()}
              className="bg-red-500 text-white text-sm px-3 py-1 rounded-full hover:bg-red-600"
            >
              End Poll
            </button>
          </div>
        )}
      </>
    )}
  </div>
</div>

        </>
      )}

      <Chat userType="teacher" />
    </div>
  );
};

export default TeacherDashboard;
