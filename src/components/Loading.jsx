// src/components/Loading.jsx
import React from 'react';
import './Loading.css'; // Ensure you have this CSS file in the same folder

const Loading = ({ onFinished }) => {
  const letters = 'LOADING'.split('');

  return (
    <div className="loading-container">
      {letters.map((letter, index) => (
        <span
          key={index}
          className="loading-letter"
          style={{ animationDelay: `${index * 0.125}s` }}
          onAnimationEnd={index === letters.length - 1 ? onFinished : null}
        >
          {letter}
        </span>
      ))}
    </div>
  );
};

export default Loading;
