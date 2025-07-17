import React from 'react';
import { useSelector } from 'react-redux';

const PollHistory = () => {
  const { pollHistory } = useSelector(state => state.poll);

  const calculateResults = (poll) => {
    const results = {};
    poll.options.forEach(option => {
      results[option] = 0;
    });

    poll.responses.forEach(([, answer]) => {
      if (results.hasOwnProperty(answer)) {
        results[answer]++;
      }
    });

    return results;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">View <span className="font-bold">Poll History</span></h2>

      {pollHistory.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No poll history available
        </div>
      ) : (
        pollHistory.map((poll, index) => {
          const results = calculateResults(poll);
          const totalResponses = poll.responses.length;

          return (
            <div key={poll.id} className="space-y-3">
              <h3 className="font-medium text-lg">Question {index + 1}</h3>

              <div className="bg-gray-100 rounded-md overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-500 text-white text-sm font-medium px-4 py-2">
                  {poll.question}
                </div>

                {poll.options.map((option, idx) => {
                  const count = results[option] || 0;
                  const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;

                  return (
                    <div key={idx} className="flex items-center border-b last:border-0">
                      <div className="w-10 h-10 flex items-center justify-center text-white bg-purple-500 rounded-l">
                        {idx + 1}
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white text-sm text-gray-800">
                        {option}
                      </div>
                      <div className="w-1/2 bg-gray-200 h-4 rounded-r overflow-hidden relative">
                        <div
                          className="h-4 bg-purple-500"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PollHistory;
