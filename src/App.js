import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import catAppear from './image/cat_appear.json'; // Import your Lottie JSON file
import CuteCat from './image/cute_cat.json'; // Assuming you have another Lottie JSON for a cute cat
import successImg from './image/success.png';
import failedImg from './image/failed.png';
import './App.css';

const width = 20;
const height = 20;

const directions = [
  { x: 0, y: -1 }, // up
  { x: 1, y: 0 },  // right
  { x: 0, y: 1 },  // down
  { x: -1, y: 0 }  // left
];

const createInitialMaze = () => {
  let maze = [];
  for (let y = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < width; x++) {
      const type = Math.random() < 0.3 ? 'obstacle' : 'path';
      row.push({ x, y, type });
    }
    maze.push(row);
  }
  maze[0][0].type = 'start';
  maze[height - 1][width - 1].type = 'destination';
  return maze;
};

const App = () => {
  const [maze, setMaze] = useState(createInitialMaze());
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: width - 1, y: height - 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggingType, setDraggingType] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [traversalType, setTraversalType] = useState('dfs');
  const isAnimating = useRef(false);
  const [showLottie, setShowLottie] = useState(false); // State variable for Lottie animation
  const [traversalSuccess, setTraversalSuccess] = useState(null); // State for success or failure
  const [showImage, setShowImage] = useState(false); // State variable for image visibility

  useEffect(() => {
    const grid = document.getElementById('grid');

    const handleMouseMove = (event) => {
      if (isDragging) {
        const rect = grid.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const x = Math.floor(mouseX / 20);
        const y = Math.floor(mouseY / 20);

        if (x >= 0 && x < width && y >= 0 && y < height && maze[y][x].type === 'path') {
          setHoveredCell({ x, y });
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging && hoveredCell) {
        const newMaze = maze.map(row => row.map(cell => {
          if (draggingType === 'start' && cell.x === start.x && cell.y === start.y) {
            return { ...cell, type: 'path' };
          }
          if (draggingType === 'destination' && cell.x === end.x && cell.y === end.y) {
            return { ...cell, type: 'path' };
          }
          if (cell.x === hoveredCell.x && cell.y === hoveredCell.y) {
            return { ...cell, type: draggingType };
          }
          return cell;
        }));
        setMaze(newMaze);

        if (draggingType === 'start') {
          setStart(hoveredCell);
        } else if (draggingType === 'destination') {
          setEnd(hoveredCell);
        }

        setHoveredCell(null);
        setIsDragging(false);
        setDraggingType(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggingType, hoveredCell, maze, start, end]);

  const handleMouseDown = (cell) => {
    if (cell.type === 'start') {
      setIsDragging(true);
      setDraggingType('start');
    } else if (cell.type === 'destination') {
      setIsDragging(true);
      setDraggingType('destination');
    }
  };

  const createMaze = () => {
    isAnimating.current = false;  // Stop any ongoing animations
    const newMaze = createInitialMaze();
    setMaze(newMaze);
    setStart({ x: 0, y: 0 });
    setEnd({ x: width - 1, y: height - 1 });
    setShowLottie(false);  // Hide Lottie animation on maze creation
    setTraversalSuccess(null); // Reset traversal success state
    setShowImage(false); // Hide the image on maze creation
  };

  const resetGrid = () => {
    maze.forEach(row => {
      row.forEach(cell => {
        if (cell.type === 'visited') {
          cell.type = 'path';
        }
      });
    });
    setMaze([...maze]);
    console.log('reset');
    console.log(maze);
  };

  const dfs = () => {
    resetGrid();
    const stack = [start];
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    visited[start.y][start.x] = true;
    isAnimating.current = true;

    const animateStep = () => {
      if (!isAnimating.current){
        setTraversalSuccess(false);
        return;
      }
      if (stack.length === 0) {
        setShowLottie(true);  // Show Lottie animation when traversal is completed
        setTraversalSuccess(false); // Set traversal as failed
        setTimeout(() => setShowImage(true), 500); // Delay image appearance by 500ms
        return;
      }

      const current = stack.pop();
      if (current.x === end.x && current.y === end.y) {
        console.log("Reached the end!");
        isAnimating.current = false;
        setShowLottie(true);  // Show Lottie animation when traversal is completed
        setTraversalSuccess(true); // Set traversal as successful
        setTimeout(() => setShowImage(true), 500); // Delay image appearance by 500ms
        return;
      }

      const currentCell = maze[current.y][current.x];
      if (currentCell.type !== 'start' && currentCell.type !== 'destination') {
        currentCell.type = 'visited';
      }

      for (const dir of directions) {
        const next = { x: current.x + dir.x, y: current.y + dir.y };
        if (next.x >= 0 && next.x < width && next.y >= 0 && next.y < height && !visited[next.y][next.x]) {
          const nextCell = maze[next.y][next.x];
          if (nextCell.type === 'path' || nextCell.type === 'destination') {
            stack.push(next);
            visited[next.y][next.x] = true;
          }
        }
      }

      setMaze([...maze]);
      setTimeout(animateStep, 100);
    };

    animateStep();
  };

  const bfs = () => {
    resetGrid();
    const queue = [start];
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    visited[start.y][start.x] = true;
    isAnimating.current = true;

    const animateStep = () => {
      if (!isAnimating.current){
        setTraversalSuccess(false);
        return;
      }
      if (queue.length === 0) {
        setShowLottie(true);  // Show Lottie animation when traversal is completed
        setTraversalSuccess(false); // Set traversal as failed
        setTimeout(() => setShowImage(true), 500); // Delay image appearance by 500ms
        return;
      }

      const current = queue.shift();
      if (current.x === end.x && current.y === end.y) {
        console.log("Reached the end!");
        isAnimating.current = false;
        setShowLottie(true);  // Show Lottie animation when traversal is completed
        setTraversalSuccess(true); // Set traversal as successful
        setTimeout(() => setShowImage(true), 500); // Delay image appearance by 500ms
        return;
      }

      const currentCell = maze[current.y][current.x];
      if (currentCell.type !== 'start' && currentCell.type !== 'destination') {
        currentCell.type = 'visited';
      }

      for (const dir of directions) {
        const next = { x: current.x + dir.x, y: current.y + dir.y };
        if (next.x >= 0 && next.x < width && next.y >= 0 && next.y < height && !visited[next.y][next.x]) {
          const nextCell = maze[next.y][next.x];
          if (nextCell.type === 'path' || nextCell.type === 'destination') {
            queue.push(next);
            visited[next.y][next.x] = true;
          }
        }
      }

      setMaze([...maze]);
      setTimeout(animateStep, 100);
    };

    animateStep();
  };

  const bfsShortestPath = () => {
    const queue = [{ ...start, path: [start] }];
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    visited[start.y][start.x] = true;

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.x === end.x && current.y === end.y) {
        console.log("Shortest path found:", current.path);
        return current.path;  // Return the shortest path
      }

      for (const dir of directions) {
        const next = { x: current.x + dir.x, y: current.y + dir.y };
        if (next.x >= 0 && next.x < width && next.y >= 0 && next.y < height && !visited[next.y][next.x]) {
          const nextCell = maze[next.y][next.x];
          if (nextCell.type === 'path' || nextCell.type === 'destination') {
            queue.push({ ...next, path: [...current.path, next] });
            visited[next.y][next.x] = true;
          }
        }
      }
    }

    console.log("No path found");
    return false;  // Return an empty array if no path is found
  };

  const startTraversal = () => {
    isAnimating.current = false;  // Stop any ongoing animations
    setTimeout(() => {
      if (traversalType === 'dfs') {
        dfs();
      } else if (traversalType === 'bfs') {
        bfs();
      }
    }, 100);
  };

  const animatePath = (path) => {
    const animateStep = () => {
      if (!isAnimating.current) {
        setTraversalSuccess(false);
        return;
      }
      if (!path) {
        setShowLottie(true);  // Show Lottie animation when traversal is completed
        setTraversalSuccess(false); // Set success based on path
        setTimeout(() => setShowImage(true), 500); // Delay image appearance by 500ms
        return;
      }
      if (path.length === 0) {
        setShowLottie(true);  // Show Lottie animation when traversal is completed
        setTraversalSuccess(true); // Set success based on path
        setTimeout(() => setShowImage(true), 500); // Delay image appearance by 500ms
        return;
      }

      const cell = path.shift();
      const currentCell = maze[cell.y][cell.x];
      if (currentCell.type !== 'start' && currentCell.type !== 'destination') {
        currentCell.type = 'visited';
        setMaze([...maze]);
      }

      setTimeout(animateStep, 100);
    };

    animateStep();
  };

  const findShortestPath = () => {
    isAnimating.current = false;  // Stop any ongoing animations
    setTimeout(() => {
      resetGrid();
      const path = bfsShortestPath();
      if (!path){
        isAnimating.current = true;
        animatePath(path)
      }
      console.log("Shortest path:", path);
      isAnimating.current = true;
      animatePath(path);
    }, 100);
  };

  return (
    <div className="main-container">
      <div>
        <h1 className="title">Maze Traversal !</h1>
        <div className="toggle-container">
          <div className="toggle-button">
            <button
              className={`dfs ${traversalType === 'dfs' ? 'active' : 'inactive'}`}
              onClick={() => setTraversalType('dfs')}
            >
              DFS
            </button>
            <button
              className={`bfs ${traversalType === 'bfs' ? 'active' : 'inactive'}`}
              onClick={() => setTraversalType('bfs')}
            >
              BFS
            </button>
          </div>
        </div>
        <div id="grid" className="grid">
          {maze.map((row, rowIndex) => row.map(cell => (
            <div
              key={`${cell.x}-${cell.y}`}
              className={`cell ${cell.type} ${hoveredCell && cell.x === hoveredCell.x && cell.y === hoveredCell.y && (draggingType === 'start' || draggingType === 'destination') ? draggingType : ''}`}
              onMouseDown={() => handleMouseDown(cell)}
            />
          )))}
        </div>
        <button onClick={startTraversal}>Start Traversal</button>
        <button onClick={createMaze}>Restart Maze</button>
        <button onClick={findShortestPath}>Find Shortest Path</button>
      </div>
    <div className="info-container">
      <p><span className="color-box" style={{ backgroundColor: 'white' }}></span> Path</p>
      <p><span className="color-box" style={{ backgroundColor: 'black' }}></span> Obstacle</p>
      <p><span className="color-box" style={{ backgroundColor: 'green' }}></span> Start</p>
      <p><span className="color-box" style={{ backgroundColor: 'red' }}></span> Destination</p>
      <p><span className="color-box" style={{ backgroundColor: 'lightblue' }}></span> Visited</p>
      <p className="info-message" style={{ fontSize: '20px' }}>
        😊 You can click and drag Start & Destination 😊
      </p>
    </div>

    <div className="cute-cat-container">
      <Lottie animationData={CuteCat} loop={true} />
    </div>
      {showLottie && (
        <div className="appear-container">
          {showImage && (
            <div>
              {traversalSuccess ? (
                <img src={successImg} alt="Success" />
              ) : (
                <img src={failedImg} alt="Failed" />
              )}
            </div>
          )}
          <div className="selected">
            <Lottie 
              animationData={catAppear} 
              loop={false} 
              onComplete={() => {
                setShowLottie(true);
                setShowImage(true);
              }} // Hide both Lottie animation and image on completion
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
