import React, { useState } from "react";
import socketService from "../services/socket";

const CreatePoll = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [maxTime, setMaxTime] = useState(60);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (question.trim() && validOptions.length >= 2) {
      socketService.createPoll({
        question: question.trim(),
        options: validOptions,
        maxTime,
        correctAnswer:
          correctAnswerIndex !== null ? options[correctAnswerIndex] : null,
      });

      setQuestion("");
      setOptions(["", ""]);
      setMaxTime(60);
      setCorrectAnswerIndex(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-8 px-4 py-6"
    >
      <div>
        <label className="font-semibold block mb-2">Enter your question</label>
        <div className="flex justify-between mb-1">
          <span></span>
          <select
            value={maxTime}
            onChange={(e) => setMaxTime(Number(e.target.value))}
            className="text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1"
          >
            {[15 , 30, 60, 90, 120, 180, 300].map((time) => (
              <option key={time} value={time}>
                {time} seconds
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          rows="3"
          maxLength={100}
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded focus:outline-none"
        />
        <div className="text-right text-sm text-gray-500">
          {question.length}/100
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Edit Options</h3>
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-4 mb-3">
            <span className="w-6 h-6 flex items-center justify-center bg-purple-600 text-white rounded-full text-xs font-medium">
              {index + 1}
            </span>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1 p-2 bg-gray-100 border border-gray-300 rounded"
              required
            />
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={correctAnswerIndex === index}
                  onChange={() => setCorrectAnswerIndex(index)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={correctAnswerIndex !== index}
                  onChange={() => setCorrectAnswerIndex(null)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span>No</span>
              </label>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddOption}
          className="mt-2 text-purple-600 text-sm border border-purple-500 rounded px-3 py-1 hover:bg-purple-50"
        >
          + Add More option
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-full font-medium hover:from-purple-600 hover:to-indigo-600"
        >
          Ask Question
        </button>
      </div>
    </form>
  );
};

export default CreatePoll;
