import React from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socket';

const StudentsList = ({ userType = 'teacher' }) => {
  const { students } = useSelector(state => state.poll);

  const handleKickStudent = (studentId) => {
    if (window.confirm('Are you sure you want to kick this student?')) {
      socketService.kickStudent(studentId);
    }
  };

  if (students.length === 0) {
    return <div className="text-center text-gray-500 py-8">No students have joined yet</div>;
  }

  return (
    <div className="border border-gray-200 rounded-md">
      <div className="grid grid-cols-2 bg-gray-50 border-b text-sm text-gray-500">
        <div className="p-3 font-medium text-black">Name</div>
        {userType === 'teacher' && <div className="p-3 font-medium text-black">Action</div>}
      </div>

      {students.map((student) => (
        <div
          key={student.id}
          className="grid grid-cols-2 items-center border-b last:border-none text-sm"
        >
          <div className="p-3">{student.name}</div>
          {userType === 'teacher' && (
            <div className="p-3">
              <button
                onClick={() => handleKickStudent(student.id)}
                className="text-blue-600 hover:underline"
              >
                Kick out
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentsList;
