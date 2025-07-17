import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import socketService from "../services/socket";
import { clearStudentInfo, setHasAnswered } from "../store/studentSlice";
import { clearStudentResult } from "../store/pollSlice";
import PollResults from "./PollResults";
import Chat from "./Chat";

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <svg className="animate-spin h-8 w-8 text-purple-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
    <div className="text-lg font-semibold text-gray-700">Wait for the teacher to start a poll</div>
  </div>
);

const StudentInterface = () => {
  const dispatch = useDispatch();
  const { studentId, name, isRegistered, hasAnswered, isKicked } = useSelector(
    (state) => state.student
  );
  const { currentPoll, timeLeft } = useSelector((state) => state.poll);
  const [studentName, setStudentName] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");

  useEffect(() => {
    if (isRegistered) socketService.studentLogin(name, studentId);
  }, [isRegistered, name, studentId]);

  useEffect(() => {
    if (currentPoll) {
      setSelectedAnswer("");
      dispatch(setHasAnswered(false));
      dispatch(clearStudentResult());
    }
  }, [currentPoll, dispatch]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (studentName.trim())
      socketService.studentLogin(studentName.trim(), studentId);
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (selectedAnswer && currentPoll) {
      socketService.submitAnswer(studentId, selectedAnswer);
      dispatch(setHasAnswered(true));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isKicked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white shadow rounded-lg p-8 text-center max-w-sm">
          <div className="text-5xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            You have been removed
          </h2>
          <p className="text-gray-500 mb-4">
            The teacher has removed you from this session.
          </p>
          <button
            onClick={() => {
              dispatch(clearStudentInfo());
              window.location.reload();
            }}
            className="bg-purple-500 text-white py-2 px-4 rounded-full"
          >
            Rejoin
          </button>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Join the Poll</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your name"
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-full hover:opacity-90"
            >
              Join Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-3xl space-y-6">
      {currentPoll ? (
  currentPoll.status === "ended" ? (
    <div className="bg-white shadow rounded-xl p-6 space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 text-center">Poll Ended!</h3>
      <PollResults />
    </div>
  ) : (
    <div className="bg-white shadow rounded-xl p-6 space-y-5">
      {/* Active Poll Rendering */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">
          Question {currentPoll.id || ""}
        </h2>
        <div className="flex items-center space-x-2 text-red-500 font-semibold">
          <span>⏱</span> <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-700 to-gray-500 text-white p-3 rounded-md">
        <h3 className="font-medium">{currentPoll.question}</h3>
      </div>

      {!hasAnswered ? (
        <form onSubmit={handleSubmitAnswer} className="space-y-3">
          {currentPoll.options.map((option, idx) => (
            <label
              key={idx}
              className={`flex items-center p-3 border rounded-md cursor-pointer ${
                selectedAnswer === option
                  ? "border-purple-500 bg-purple-50"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <div className="text-sm font-bold text-purple-600 mr-3">
                {idx + 1}
              </div>
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="hidden"
              />
              <span className="text-gray-800">{option}</span>
            </label>
          ))}
          <button
            type="submit"
            disabled={!selectedAnswer}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-full disabled:bg-gray-300"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="text-center space-y-3">
          <h3 className="text-lg font-semibold text-green-600">
            Answer Submitted!
          </h3>
          <PollResults />
        </div>
      )}
    </div>
  )
) : (
  <div className="bg-white shadow rounded-xl p-6 text-center space-y-3">
    <Spinner />
  </div>
)}


        <Chat userType="student" userName={name} />
      </div>
    </div>
  );
};

export default StudentInterface;
