// i just inserted cdn package link : <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js" integrity="sha512-a+SUDuwNzXDvz4XrIcXHuCf089/iJAoN4lmrXJg18XnduKK6YlDHNRalv4yd1N40OKI80tFidF+rqTFKGPoWFQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
// need to use crypto-js 



const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

// 1 blue door
// 2 red door
// 3 free path
// 4 columna
// 0 wall
const maze = [
    [0, 1, 0, 0, 0, 2, 2, 2, 0, 0, 0],
    [0, 3, 2, 3, 3, 3, 3, 3, 2, 3, 0],
    [0, 3, 0, 3, 0, 1, 0, 2, 0, 1, 0],
    [0, 3, 1, 3, 2, 3, 3, 3, 1, 3, 0],
    [0, 2, 0, 2, 0, 1, 0, 1, 0, 3, 0],
    [0, 3, 3, 3, 1, 3, 3, 3, 3, 3, 0],
    [0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0],
    [0, 3, 3, 3, 1, 3, 3, 3, 2, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  
  const cellSize = 25; // Adjust based on your canvas size

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
    ctx.strokeStyle = 'yellowgreen';
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

function generateSecurePathHash(path) {
    const timestamp = Date.now();
    const pathString = path.map(pos => `${pos.x},${pos.y}`).join(';');
    const toHash = `${pathString}|${timestamp}`;
    return CryptoJS.SHA256(toHash).toString(CryptoJS.enc.Hex);
}

async function findPath(maze, currentPos, endPoints, path = [], lastDoorColor = 1) {
    // print un console lastDoorColor real color (1 blue door, 2 red door, 3 free path, 0 wall)
    // const colorMap = {
    //     1: 'blue',
    //     2: 'red',
    //     3: 'green',
    //     0: 'black'
    // };
    // console.log(`Last door color: ${colorMap[lastDoorColor]}`);

    drawMaze(maze, path.concat([currentPos]));
    await new Promise(resolve => setTimeout(resolve, 50)); // Delay for visualization

    if (isEndPoint(currentPos, endPoints)) {
        return path.concat(currentPos);
    }

    const directions = [
        { x: -1, y: 0 }, { x: 1, y: 0 }, // Up, Down
        { x: 0, y: -1 }, { x: 0, y: 1 }  // Left, Right
    ];
    // i need to randomize directions every time    
    directions.sort(() => 0.5 - Math.random());

    for (const {x, y} of directions) {
        const nextX = currentPos.x + x;
        const nextY = currentPos.y + y;

        if (isValidMove(maze, nextX, nextY, lastDoorColor)) {
            const nextCell = maze[nextX][nextY];
            const nextDoorColor = (nextCell !== 3 && (nextCell === 1 || nextCell === 2)) ? nextCell : lastDoorColor;
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
async function init() {
    document.getElementById('startButton').setAttribute('disabled', true);
    document.getElementById('startButton').innerHTML = 'Solving...';
    const path = await findPath(maze, startPoint, endPoints);
    if (path) {
        alert('Maze solved successfully!');
        const pathHash = generateSecurePathHash(path);
        console.log(pathHash); 
        document.getElementById('notification').innerHTML = pathHash;
    } else {
        document.getElementById('startButton').innerHTML = 'Re-Start';
        document.getElementById('startButton').removeAttribute('disabled');
        // Display for an updated message on id="notification" html element
        document.getElementById('notification').innerHTML = 'No solution found.';
    }
}

document.getElementById('startButton').addEventListener('click', async () => {
    document.getElementById('notification').innerHTML = '';
    init();
});


init();

