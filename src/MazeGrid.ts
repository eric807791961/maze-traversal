import React from 'react';
import './App.css';

const MazeGrid = ({ maze, handleMouseDown }) => {
  return (
    <div id="grid" className="grid">
      {maze.map((row, rowIndex) => row.map(cell => (
        <div
          key={`${cell.x}-${cell.y}`}
          className={`cell ${cell.type}`}
          onMouseDown={() => handleMouseDown(cell)}
        />
      )))}
    </div>
  );
};

export default MazeGrid;
