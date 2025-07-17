import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import socketService from './services/socket';
import TeacherDashboard from './components/TeacherDashboard';
import StudentInterface from './components/StudentInterface';

const App = () => {
  const [userType, setUserType] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleUserTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType) {
      alert('Please select a role to continue');
      return;
    }
    setUserType(selectedType);
  };

  if (!userType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 px-4">
        <div className="text-xs bg-purple-600 text-white px-4 py-1 rounded-full mb-4">
          ⭐ Intervue Poll
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center">
          Welcome to the <span className="text-black">Live Polling System</span>
        </h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="flex gap-6 mb-8">
          <div
            onClick={() => handleUserTypeSelect('student')}
            className={`cursor-pointer border rounded-lg p-4 w-52 transition ${
              selectedType === 'student' ? 'border-purple-600' : 'border-gray-300'
            }`}
          >
            <h2 className="font-semibold ">I’m a Student</h2>
          </div>

          <div
            onClick={() => handleUserTypeSelect('teacher')}
            className={`cursor-pointer border rounded-lg p-4 w-52 transition ${
              selectedType === 'teacher' ? 'border-purple-600' : 'border-gray-300'
            }`}
          >
            <h2 className="font-semibold mb-2">I’m a Teacher</h2>
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="bg-purple-500 text-white px-8 py-2 rounded-full font-semibold hover:opacity-90 transition"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <Provider store={store}>
      {userType === 'teacher' ? <TeacherDashboard /> : <StudentInterface />}
    </Provider>
  );
};

export default App;
