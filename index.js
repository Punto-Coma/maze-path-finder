const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

// 1 blue door
// 2 red door
// 3 free path
// 0 wall
const maze = [
    [0, 1, 0, 2, 2, 0, 0],
    [0, 3, 3, 1, 2, 1, 0],
    [0, 2, 2, 1, 1, 3, 0],
    [0, 3, 3, 3, 3, 3, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ];
  
  const cellSize = 50; // Adjust based on your canvas size

function drawMaze(maze, path = []) {
ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing

// Draw the maze
maze.forEach((row, x) => {
    row.forEach((cell, y) => {
        if (cell === 0) { // Wall
            ctx.fillStyle = 'black';
        } else if (cell === 1) { // Blue Door
            ctx.fillStyle = 'blue';
        } else if (cell === 2) { // Red Door
            ctx.fillStyle = 'red';
        } else { // Path
            ctx.fillStyle = 'white';
        }
        ctx.fillRect(y * cellSize, x * cellSize, cellSize, cellSize);
    });
});

// Draw the path with lines
if (path.length > 1) {
    ctx.beginPath();
    ctx.moveTo(path[0].y * cellSize + cellSize / 2, path[0].x * cellSize + cellSize / 2);
    path.forEach(pos => {
        ctx.lineTo(pos.y * cellSize + cellSize / 2, pos.x * cellSize + cellSize / 2);
    });
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 5;
    ctx.stroke();
}
}


const startPoint = { x: 0, y: 1 };
const endPoints = [{ x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }]; // Two possible end points

function isEndPoint(currentPos, endPoints) {
    return endPoints.some(point => point.x === currentPos.x && point.y === currentPos.y);
  }

function isValidMove(maze, nextX, nextY, lastDoorColor) {
if (nextX < 0 || nextY < 0 || nextX >= maze.length || nextY >= maze[0].length) {
    return false;
}

const nextCell = maze[nextX][nextY];
if (nextCell === 0) {
    return false;
}

if ((nextCell === 1 || nextCell === 2) && nextCell === lastDoorColor) {
    return false;
}

return true;
}

function printMazeWithCurrentPath(maze, path) {
// Clone the maze to avoid modifying the original
const mazeClone = JSON.parse(JSON.stringify(maze));

// Mark the current path in the maze clone
path.forEach(pos => {
    mazeClone[pos.x][pos.y] = 4;
});

// Print the maze with the path
mazeClone.forEach(row => {
    let rowString = '';
    row.forEach(cell => {
    if (cell === 4) {
        rowString += 'P '; // P represents the current path
    } else {
        rowString += cell + ' ';
    }
    });
    console.log(rowString);
});
console.log('\n'); // New line for better separation between iterations
}

async function findPath(maze, currentPos, endPoints, path = [], lastDoorColor = 1) {
drawMaze(maze, path.concat([currentPos]));
await new Promise(resolve => setTimeout(resolve, 700)); // Delay for visualization



if (isEndPoint(currentPos, endPoints)) {
    return path.concat(currentPos);
}

const directions = [
    { x: -1, y: 0 }, { x: 1, y: 0 }, // Up, Down
    { x: 0, y: -1 }, { x: 0, y: 1 }  // Left, Right
];

for (const {x, y} of directions) {
    const nextX = currentPos.x + x;
    const nextY = currentPos.y + y;

    if (isValidMove(maze, nextX, nextY, lastDoorColor)) {
    const nextCell = maze[nextX][nextY];
    const nextDoorColor = (nextCell === 3) ? lastDoorColor : nextCell;
    if (!path.some(pos => pos.x === nextX && pos.y === nextY)) { // Prevent cycles
        const newPath = findPath(maze, { x: nextX, y: nextY }, endPoints, path.concat([currentPos]), nextDoorColor);
        if (newPath) {
        return newPath;
        }
    }
    }
}

return null;
}

const path = findPath(maze, startPoint, endPoints);
  