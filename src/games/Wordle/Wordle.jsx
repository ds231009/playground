import styles from './Wordle.module.css'

import { useState, useEffect } from "react";
import {enteredWord, getWord, createKeyboardLayout} from "./logic.js";

export default function Sudoku() {
    const [solution,setSolution] = useState("")
    const [solutionLength] = useState(5)
    const [isGameOver,setIsGameOver] = useState(false)
    const [board, setBoard] = useState(
        Array(6).fill(null).map(() => Array(solutionLength).fill({ letter: "", status: "empty" }))
    );
    const [currentCell, setCurrentCell] = useState({ row: 0, col: 0 });

    const LETTERS = [
        "Q","W","E","R","T","Y","U","I","O","P",
        "A","S","D","F","G","H","J","K","L",
        "Z","X","C","V","B","N","M"
    ];

    const [keys, setKeys] = useState(() => createKeyboardLayout(LETTERS));

    const [machineVisibility, setMachineVisibility] = useState(false)

    function updateCell(row, col, newCell) {
        if (col  !== solutionLength) {
            setBoard(prevBoard =>
                prevBoard.map((r, rIndex) =>
                    r.map((cell, cIndex) =>
                        rIndex === row && cIndex === col ? newCell : cell
                    )
                )
            )
            setCurrentCell({row, col: col + 1})
            console.log(currentCell)
        }
    }

    useEffect(() => {
        async function fetchSolution() {
            const word = await getWord(solutionLength);
            setSolution(word);
        }

        fetchSolution();
    }, []);


    useEffect(() => {
        function handleKeyDown(event) {

            const key = event.key;
            const  {row, col} = currentCell;

            if (isGameOver || row === 6) return

            if (event.code.substring(0,3) === "Key") {
                updateCell(row, col, {letter: key.toUpperCase(), status: "filled"});
            }
            if (key === "Enter") {
                if (col === solutionLength) {
                    let result = enteredWord(board[currentCell.row], solution, solutionLength);
                    setCurrentCell({row: row + 1, col: 0})
                    if (result[1]) {
                        setIsGameOver("win")
                    }
                    else if (row  === 5) {
                        setIsGameOver("loss")
                    }
                    for (let i = 0; i < solutionLength; i++) {
                        if (result[0][i]) {
                            let status = (result[1]) ? "solved" : result[0][i].status
                            updateCell(row, result[0][i].id, {letter: result[0][i].char, status: status});
                        }
                    }

                }
            }
            if (key === "Backspace") {
                setCurrentCell(prev => {
                    const newCol = Math.max(prev.col - 1, 0); // prevent negative
                    updateCell(prev.row, newCol, {letter: "", status: ""}); // clear the correct cell
                    return { row: prev.row, col: newCol };
                });
            }

        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentCell])

    return (
        <>
            <div className={styles.WordleGame}>
                <div className={styles.informationContainer}>
                    {isGameOver ?
                        <div id="overlay">
                            {
                                isGameOver === "loss"
                                    ?
                                    "You lost. The word was: " + solution
                                    :
                                    "Win"
                            }
                        </div>
                        : null}
                </div>
                <div className={`${styles.game} ${machineVisibility ? styles.visible: styles.hidden}`}>
                    <div className={styles.gameContainer}>
                        <div className={styles.gameHUD}>
                            <button>Pause</button>
                            <span>0:00</span>
                            <button id={styles.button} onClick={() => machineVisibility ? setMachineVisibility(false) : setMachineVisibility(true)}>Show Machine</button>
                        </div>

                        <div  className={`${styles.board} ${isGameOver ? styles.over : ""}`}>
                            {board.map((row, rowIndex) => (
                                <div className={styles.row} key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <div
                                            className={`${styles.cell} ${cell.status ? styles[cell.status] : ""}`}
                                            key={colIndex}
                                        >
                                            {cell.letter}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className={styles.gameControls}>
                            {keys.map((row, rowIndex) => (
                                <div className={styles.controlRow} key={rowIndex}>
                                    {keys[rowIndex].map(key => (
                                        <button
                                            id={`key${key.letter}`}
                                            className={styles.key} key={key.letter}
                                            onClick={() => updateCell(currentCell.row, currentCell.col, {letter: key.letter.toUpperCase(), status: "filled"})}>
                                            {key.letter}
                                        </button>
                                    ))}
                                </div>
                            ))}

                        </div>
                    </div>
                    <div className={styles.machineContainer}>
                        <div className={styles.machineHUD}>
                            <button>Pause</button>
                            <span>0:00</span>
                        </div>
                        <div className={styles.MachineBoard}>Machine</div>
                        <div className={styles.gameControls}>
                            {keys.map((row, rowIndex) => (
                                <div className={styles.controlRow} key={rowIndex}>
                                    {keys[rowIndex].map(key => (
                                        <button id={`key${key.letter}`} className={styles.key} key={key.letter}>{key.letter}</button>
                                    ))}
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
