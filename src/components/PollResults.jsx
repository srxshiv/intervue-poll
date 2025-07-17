import React from 'react';
import { useSelector } from 'react-redux';

const PollResults = () => {
  const { currentPoll, pollResults } = useSelector(state => state.poll);

  if (!currentPoll || !pollResults) {
    return (
      <div className="text-center text-gray-500 py-8">
        No results available
      </div>
    );
  }

  const { results, totalResponses, totalStudents } = pollResults;

  return (
    <div className="space-y-5">
      <div className="rounded-t-lg bg-gradient-to-r from-gray-700 to-gray-600 text-white p-4 text-lg font-semibold">
        {currentPoll.question}
      </div>

      <div className="border border-gray-300 rounded-b-lg overflow-hidden space-y-2 p-4">
        {currentPoll.options.map((option, index) => {
          const count = results[option] || 0;
          const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-gray-800 font-medium">{option}</span>
                <span className="ml-auto text-sm text-gray-600">{percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-indigo-500 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>Responses: {totalResponses}</span>
        <span>Total Students: {totalStudents}</span>
      </div>
    </div>
  );
};

export default PollResults;
