import React, { useState, useEffect, useRef } from "react";
import { ActionPanel, Action, List } from "@raycast/api";

export default function Tetris() {
  // Utility functions
  let generateNewGrid = () => Array(22).fill().map(_ => Array(10).fill(0))
  let rotate = {
    cw: (matrix) => matrix[0].map((_, index) => matrix.map(row => row[index]).reverse()),
    ccw: (matrix) => matrix[0].map((val, index) => matrix.map(row => row[row.length - 1 - index]))
  }

  // useEffect(() => setGame(), [piece, board]) -> useEffect(() => setMarkdown(), [game]) -> Renders `markdown`

  let levelG = {
    test: 0,
    1: 0.01667,
    2: 0.021017,
    3: 0.026977,
    4: 0.035256,
    5: 0.04693,
    6: 0.06361,
    7: 0.0879,
    8: 0.1236,
    9: 0.1775,
    10: 0.2598,
    11: 0.388,
    12: 0.59,
    13: 0.92,
    14: 1.46,
    15: 2.36,
  };

  let pieces = [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  ]

  let bag = JSON.parse(JSON.stringify(pieces));
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }

  // Just the pieces that have already been placed (no current piece)
  // Uses ref to update through setTimeout
  let board = useRef(generateNewGrid());

  let generatePiece = () => {
    let newPiece = bag.shift()
    if (bag.length === 0) {
      let newBag = JSON.parse(JSON.stringify(pieces));
      for (let i = newBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
      }
      bag = newBag;
    }
    return {
      x: newPiece.length === 2 ? 4 : 3,
      y: 0,
      shape: newPiece
    }
  }

  // A object that stores data about the current piece
  let [piece, setPiece] = useState(generatePiece());

  // A completely combined 20x10 matrix of everything in the game
  let [game, setGame] = useState(generateNewGrid());

  // Actual markdown
  let [markdown, setMarkdown] = useState("")

  let speed = useRef(200);

  let [points, setPoints] = useState(0);
  let [lines, setLines] = useState(0);
  let [level, setLevel] = useState(1);

  useEffect(() => {
    setLevel(Math.floor(lines / 10) + 1)
  }, [points])

  useEffect(() => {
    let frameRate = 60;
    let millisecondsPerCell = 1000 / (levelG[level] * frameRate);
    speed.current = millisecondsPerCell
  }, [level])

  let [startTime, setStartTime] = useState(0);
  useEffect(() => {
    setTimeout(() => {
      tick()
    }, speed.current)
    setStartTime(Date.now())
  }, [])

  let handleLineClear = () => {
    let matrix = board.current
    let lines = 0;
    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i].every(x => x === 1)) {
        matrix.splice(i, 1)
        matrix.unshift(new Array(10).fill(0));
        lines++;
      }
    }
    setLines(prevLines => prevLines += lines)
    switch (lines) {
      case 1:
        setPoints(pts => pts + 100)
        break;
      case 2:
        setPoints(pts => pts + 300)
        break;
      case 3:
        setPoints(pts => pts + 500)
        break;
      case 4:
        setPoints(pts => pts + 800)
        break;
      default:
        break;
    }
  }

  let tick = () => {
    setPiece((original) => {
      if (!hasCollision({ ...original, y: original.y + 1 })) {
        let newPiece = JSON.parse(JSON.stringify(original));
        newPiece.y++;
        return newPiece;
      } else {
        let newBoard = JSON.parse(JSON.stringify(board.current));
        let { x, y, shape } = original;
        for (let i = 0; i < shape.length; i++) {
          for (let j = 0; j < shape[0].length; j++) {
            if (shape[i][j] !== 0 && newBoard[y + i]) {
              newBoard[y + i][x + j] = shape[i][j];
            }
          }
        }
        board.current = newBoard

        let newPiece = generatePiece()

        handleLineClear();
        return newPiece;
      }
    })
    setTimeout(() => {
      tick()
    }, speed.current)
  }



  let hasCollision = (checkPiece = piece) => {
    let { shape, x, y } = checkPiece;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[0].length; j++) {
        // Only need to check collision if there's actually something on the piece model!
        if (shape[i][j] !== 0) {
          let newI = y + i;
          let newJ = x + j;
          if (board.current[newI] !== undefined && board.current[newI][newJ] !== undefined && board.current[newI][newJ] === 0) {
            // Can move piece!
          } else {
            return true;
          }
        }
      }
    }
    return false;
  }

  function convertToMmSs(milliseconds) {
    var totalSeconds = Math.floor(milliseconds / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    var mmss = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    return mmss;
  }

  let generateMarkdown = () => {
    let result = "\n"
    for (let i = 0; i < game.length / 2; i += 1) {
      let matrixSlice = game.slice(i * 2, i * 2 + 2);
      let current = ""
      for (let j = 0; j < game[0].length; j++) {
        let blocks = {
          "00": " ",
          "01": "▄",
          "10": "▀",
          "11": "█",
        }
        let blockType = [matrixSlice[0][j], matrixSlice[1][j]].join("");
        current += blocks[blockType]
      }
      if (i === 0) {
        result += " " + current + " \n"
      } else if (i === 7) {
        result += "│" + current + `│ LVL:    ${level} \n`
      } else if (i === 8) {
        result += "│" + current + `│ TIME:   ${convertToMmSs(Date.now() - startTime)}\n`
      } else if (i === 9) {
        result += "│" + current + `│ LINES:  ${String(lines).padStart(6, "0")}\n`
      } else if (i === 10) {
        result += "│" + current + `│ POINTS: ${String(points).padStart(6, "0")} \n`
      } else {
        result += "│" + current + "│\n"
      }
    }
    result += "╰──TETRIS──╯\n"
    return result;
  }

  useEffect(() => {
    let newGame = JSON.parse(JSON.stringify(board.current));
    let { x, y, shape } = piece;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[0].length; j++) {
        if (shape[i][j] !== 0) {
          newGame[y + i][x + j] = shape[i][j];
        }
      }
    }
    setGame(newGame);
  }, [piece, board])

  useEffect(() => {
    setMarkdown((prevMarkdown) => `\`\`\`${generateMarkdown(prevMarkdown)}\`\`\``);
  }, [game])

  let handleKeyDown = (key) => {
    switch (key) {
      case "d":
        setPiece((original) => {
          if (!hasCollision({ ...original, x: original.x + 1 })) {
            let newPiece = JSON.parse(JSON.stringify(original));
            newPiece.x++;
            return newPiece;
          }
          return original;
        })
        break;
      case "a":
        setPiece((original) => {
          if (!hasCollision({ ...original, x: original.x - 1 })) {
            let newPiece = JSON.parse(JSON.stringify(original));
            newPiece.x--;
            return newPiece;
          }
          return original;
        })
        break;
      case "w":
        setPiece((original) => {
          if (!hasCollision({ ...original, shape: rotate.cw(original.shape) })) {
            let newPiece = JSON.parse(JSON.stringify(original));
            newPiece.shape = rotate.cw(original.shape);
            return newPiece;
          }
          return original;
        })
        break;
      case "s":
        setPiece((original) => {
          if (!hasCollision({ ...original, y: original.y + 1 })) {
            let newPiece = JSON.parse(JSON.stringify(original));
            newPiece.y += 1;
            return newPiece;
          }
          return original;
        })
        break;
      case " ":
        setPiece((original) => {
          let dy = 0;
          while (!hasCollision({ ...original, y: original.y + dy })) {
            dy += 1;
          }
          let newPiece = JSON.parse(JSON.stringify(original));
          newPiece.y += dy - 1;
          return newPiece;
        })
        break;
      default:
        return;
    }
  }

  return (
    <List
      searchText=""
      searchBarPlaceholder="Focus your cursor here..."
      onSearchTextChange={(key) => {
        handleKeyDown(key)
      }}
      isShowingDetail={true}
    >
      <List.Item
        title="Tetris"
        detail={<List.Item.Detail markdown={markdown} />}
        actions={
          <ActionPanel>
            <Action
              title="Move Piece Left"
              shortcut={{ modifiers: ["shift"], key: "a" }}
              onAction={() => handleKeyDown("a")}
            />
            <Action
              title="Move Piece Right"
              shortcut={{ modifiers: ["shift"], key: "d" }}
              onAction={() => handleKeyDown("d")}
            />
            <Action
              title="Move Piece Down"
              shortcut={{ modifiers: ["shift"], key: "s" }}
              onAction={() => handleKeyDown("s")}
            />
            <Action
              title="Rotate Piece"
              shortcut={{ modifiers: ["shift"], key: "w" }}
              onAction={() => handleKeyDown("w")}
            />
          </ActionPanel>
        }
      >
      </List.Item>
    </List>
  )
}