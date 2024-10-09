import { useState } from "react";

function Square({ value, onSquareClick, isWinningSquare, isLastClicked }) {
  const className = `w-16 h-16 text-2xl font-bold text-center border-2 border-gray-300 rounded-md 
                       ${isWinningSquare ? 'bg-red-300' : isLastClicked ? 'bg-blue-200' : 'hover:bg-gray-200 active:bg-gray-300'} 
                       transition duration-150`;

  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, lastClickedSquare }) {
  const result = calculateWinner(squares);
  const winner = result?.winner;
  const winningLine = result?.line;

  function handleClick(i) {
    if (winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares, i);
  }

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (squares.every(square => square !== null)) {
    status = 'Draw';
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const boardSize = Math.sqrt(squares.length);
  let board = [];
  for (let i = 0; i < boardSize; i++) {
    let row = [];
    for (let j = 0; j < boardSize; j++) {
      const index = i * boardSize + j;
      const isWinningSquare = winningLine?.includes(index);
      const isLastClicked = index === lastClickedSquare;
      row.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          isWinningSquare={isWinningSquare}
          isLastClicked={isLastClicked}
        />
      );
    }
    board.push(
      <div key={i} className="grid grid-cols-3 gap-2 mb-2">
        {row}
      </div>
    );
  }

  return (
    <>
      <div className="status text-xl font-semibold mb-4">{status}</div>
      <div>{board}</div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null) }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [lastClickedSquare, setLastClickedSquare] = useState(null);
  const xIsNext = currentMove % 2 === 0;
  const current = history[currentMove];
  const currentSquares = current.squares;

  function handlePlay(nextSquares, i) {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, lastMove: i },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setLastClickedSquare(i);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function resetGame() {
    setHistory([{ squares: Array(9).fill(null) }]);
    setCurrentMove(0);
    setLastClickedSquare(null);
  }

  const moves = history.map((step, move) => {
    let description;
    if (move === currentMove) {
      description = "You are at move #" + move;
      return <li key={move}>{description}</li>;
    } else {
      if (move > 0) {
        const row = Math.floor(step.lastMove / 3) + 1;
        const col = (step.lastMove % 3) + 1;
        description = `Go to move (${row}, ${col})`;
      } else {
        description = "Go to game start";
      }
      return (
        <li key={move}>
          <button className="text-blue-500 hover:underline" onClick={() => jumpTo(move)}>
            {description}
          </button>
        </li>
      );
    }
  });

  if (!isAscending) {
    moves.reverse();
  }

  return (
    <div className=" game flex flex-col items-center">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} lastClickedSquare={lastClickedSquare} />
      </div>
      <div className="game-info mt-4">
        <button className="mb-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setIsAscending(!isAscending)}>
          {isAscending ? "Sort descending" : "Sort ascending"}
        </button>
        <button className="mb-2 ml-2 p-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={resetGame}>
          Restart
        </button>
        <ol className="list-decimal pl-4">{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}
