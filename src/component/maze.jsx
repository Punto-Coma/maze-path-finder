import React, { useCallback, useEffect, useRef, useState } from 'react';
import CryptoJS from 'crypto-js';

const cellSize = 25
const Maze =() =>{
    const [ctx, setCtx] = useState(undefined);
    const canvas = useRef(null);
    const [maze, _] = useState([
        [0, 1, 0, 0, 0, 2, 2, 2, 0, 0, 0],
        [0, 3, 2, 3, 3, 3, 3, 3, 2, 3, 0],
        [0, 3, 0, 3, 0, 1, 0, 2, 0, 1, 0],
        [0, 3, 1, 3, 2, 3, 3, 3, 1, 3, 0],
        [0, 2, 0, 2, 0, 1, 0, 1, 0, 3, 0],
        [0, 3, 3, 3, 1, 3, 3, 3, 3, 3, 0],
        [0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0],
        [0, 3, 3, 3, 1, 3, 3, 3, 2, 3, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);
    const [startPoint] = useState({ x: 0, y: 1 });
    const [endPoints] = useState([{ x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }]);
    
    const [notification, setNotification] = useState('');
    const [isSolving, setIsSolving] = useState(false);

    const drawMaze = (maze, path = []) => {
        if (!ctx) {
            console.log('Context (ctx) is not yet defined.');
            return; // Exit if ctx is not defined
        }
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
    function isEndPoint(currentPos, endPoints) {
        return endPoints.some(point => point.x === currentPos.x && point.y === currentPos.y);
    }

    async function findPath(maze, currentPos, endPoints, path = [], lastDoorColor = 1) {
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
        setIsSolving(true);
        setNotification('');
        const path = await findPath(maze, startPoint, endPoints);
        if (path) {
            setNotification(`Path found. Hash: ${generateSecurePathHash(path)}`);
        } else {
            setNotification('Path not found.');
        }
        setIsSolving(false);
    }

    useEffect(() => {
        if(ctx) {
            drawMaze(maze);
            init();
        } else {
            if(canvas.current){
                setCtx(canvas.current.getContext('2d'))
            }
        }
    }, [ctx]);


    return(
        <div className='flex flex-col items-center justify-center gap-10 mt-10'>
            <canvas ref={canvas} width="275" height="225" />

            <button onClick={isSolving ? null : init} disabled={isSolving} className="acss-1wtrwk2 relative flex h-11 w-full items-center justify-center px-6 rounded-full before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max">
                <div className="acss-1mqyh2o rounded-full"></div>
                <span className="relative text-base font-semibold text-white">{isSolving ? 'Solving...' : 'Start'}</span>
            </button>
            <div id="notification">{notification}</div>
        </div>
    )
}
export default Maze