import styles from './Sudoku.module.css'

import { useState, useEffect, useRef } from "react";
import {SudokuGraph,} from "./sudokuGraph.js";
import Sudoku3DView from "./components/Sudoku3DView.jsx";

export default function Sudoku() {
    const [isGameOver,setIsGameOver] = useState(false)
    const [isCandidMode,setIsCandidMode] = useState(false)

    const [activeCell, setActiveCell] = useState(null);
    const graphRef = useRef(new SudokuGraph());
    const [board, setBoard] = useState([]);

    const machineRunningRef = useRef(false);

    const [keys, setKeys] = useState([1,2,3,4,5,6,7,8,9].map(num => ({ letter: num, status: "empty" })));

    const [machineVisibility, setMachineVisibility] = useState(false)
    const updateUI = () => {
        const snapshot = Array.from(graphRef.current.nodes.values()).map(node => ({
            id: node.id,
            position: node.position,
            peers: node.peers,

            initial: node.initial,

            value: node.value,
            candidates: node.candidates,

            machineValue: node.machineValue,
            machineCandidates: node.machineCandidates,

            isHighlighted: node.isHighlighted,
            state: node.state
        }));
        setBoard(snapshot);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // If no cell is selected, don't do anything
            if (activeCell === null) return;

            // 1. Handle Number Inputs (1-9)
            if (e.key >= '1' && e.key <= '9') {
                const number = parseInt(e.key);
                graphRef.current.handleNumberInput(activeCell.id, number, isCandidMode); // Your graph logic function
                updateUI()
            }

            // 2. Handle Deletion (Backspace or Delete)
            else if (e.key === 'Backspace' || e.key === 'Delete') {
                graphRef.current.handleNumberInput(activeCell.id, null, isCandidMode); // Clear the cell
                updateUI()

            }

            // 3. Handle Arrow Navigation
            else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault(); // Prevent the whole webpage from scrolling

                let nextPosition = {row: activeCell.position.row, col: activeCell.position.col};
                // Grid math assuming IDs 0-80, 9 columns wide
                if (e.key === 'ArrowUp' && activeCell.position.row > 0) nextPosition.row -= 1;
                if (e.key === 'ArrowDown' && activeCell.position.row <= 71) nextPosition.row += 1;
                if (e.key === 'ArrowLeft' && activeCell.position.col % 9 !== 0) nextPosition.col -= 1;
                if (e.key === 'ArrowRight' && (activeCell.position.col + 1) % 9 !== 0) nextPosition.col += 1;

                let nexCell = graphRef.current.nodes.get(`${nextPosition.row}-${nextPosition.col}`)
                setActiveCell(nexCell);
                console.log(e.key, "pressed. Moving from", activeCell.position, "to", nextPosition,activeCell, graphRef.current.nodes.get(`${nextPosition.row}-${nextPosition.col}`));
                updateUI()
            }
        };

        // Attach listener
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function (Crucial to prevent duplicate listeners!)
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeCell, isCandidMode]); // Re-bind listener whenever activeCell changes

    const handleInput = (number) => {
        // The graph handles the complex cascade logic
        graphRef.current.handleNumberInput(activeCell.id,number, isCandidMode);

        // Tell React to draw the new result
        updateUI();
    };

    useEffect(() => {
        graphRef.current.initializeBoard();
        updateUI();
    }, []);


    return (
        <>
            <div className={styles.WordleGame}>
                <div className={styles.informationContainer}>
                    {isGameOver ?
                        <div id="overlay">
                            {
                                isGameOver === "loss"
                                    ?
                                    "You lost"
                                    :
                                    "Win"
                            }
                        </div>
                        : null}
                </div>
                <div className={`${styles.game}  ${machineVisibility ? styles.visible: styles.hidden2}`}>
                    <div className={styles.gameContainer}>
                        <div className={styles.gameHUD}>
                            <button>Pause</button>
                            <span>0:00</span>
                            <button id={styles.button} onClick={() => setMachineVisibility(!(machineVisibility))}>Show Machine</button>
                        </div>

                        <div  className={`${styles.board} ${isGameOver ? styles.over : ""}`}>
                            {board.map((cell, index) => (
                                cell.id &&
                                <div
                                    className={`${styles.cell} ${cell.value ? "" : styles.cellCandid} ${cell.state ? styles[cell.state] : ""} ${cell.id === activeCell?.id ? styles.cellActive : ""}`}
                                    style={{marginLeft: cell.position.col===3 || cell.position.col===6 ? "2px" : "", marginTop: cell.position.row===3 || cell.position.row===6 ? "2px" : ""}}
                                    key={index}
                                    onClick={() => {
                                        setActiveCell(cell)
                                        console.log("Clicked cell ID:", cell.id, isCandidMode)
                                    }}
                                >
                                    {cell.value ?
                                        <span>{cell.value}</span>
                                        :
                                        cell.candidates ? cell.candidates.map(candidate => (
                                                <span
                                                    key={candidate}
                                                    style={{gridArea: Math.floor((candidate - 1) / 3)+ 1 + "/" + (((candidate - 1) % 3) + 1)}}>
                                                    {candidate}
                                                </span>
                                            )) : null
                                    }
                                </div>
                            ))}
                        </div>
                        <div className={styles.gameControls}>
                            {keys.map(key => (
                                <button
                                    id={`key${key.letter}`}
                                    className={`${styles.key} ${isCandidMode ? styles.candidKey : ""}`} key={key.letter}
                                    onClick={() => handleInput(key.letter)}
                                >
                                    {key.letter}
                                </button>
                            ))}
                            <button
                                className={`${styles.key} ${isCandidMode ? styles.candidKey : ""}`}
                                onClick={() => setIsCandidMode((!(isCandidMode)))}
                            >
                                Set Candid
                            </button>
                        </div>
                    </div>
                    <div className={`${styles.machineContainer}  ${machineVisibility ? styles.visible: styles.hidde2n}`}>
                        <div className={styles.machineHUD}>
                            <button onClick={() => {
                                machineRunningRef.current = true
                                graphRef.current.runUntilSolved(updateUI, machineRunningRef, 10)
                            }}>
                                Start Solving
                            </button>
                            <button onClick={() => machineRunningRef.current = false}>
                                Pause Solving
                            </button>
                            <button onClick={() => {
                                graphRef.current.makeMachineStep()
                                updateUI()
                            }}>
                                Step
                            </button>
                            <button onClick={() => {
                                graphRef.current.makeNextNMachineStep(30)
                                updateUI()
                            }}>
                                Make 30 Steps
                            </button>
                        </div>
                        <div className={styles.MachineBoard}>
                            <Sudoku3DView board={board} boardState={graphRef.current.states.machine}/>
                            <div  className={`${styles.board} ${isGameOver ? styles.over : ""}`}>
                                {board.map((cell, index) => (
                                    cell.id &&
                                    <div
                                        className={`${styles.cell} ${cell.machineValue ? "" : styles.cellCandid} ${cell.state ? styles[cell.state] : ""} ${graphRef.current.callstack.at(-1)?.id === cell?.id ? styles.cellActive : ""}`}
                                        style={{marginLeft: cell.position.col===3 || cell.position.col===6 ? "2px" : "", marginTop: cell.position.row===3 || cell.position.row===6 ? "2px" : ""}}
                                        key={index}
                                    >
                                        {cell.machineValue ?
                                            <span>{cell.machineValue}</span>
                                            :
                                            cell.machineCandidates ? cell.machineCandidates.map(machineCandidate => (
                                                <span
                                                    key={machineCandidate}
                                                    style={{gridArea: Math.floor((machineCandidate - 1) / 3)+ 1 + "/" + (((machineCandidate - 1) % 3) + 1)}}>
                                                    {machineCandidate}
                                                </span>
                                            )) : null
                                        }
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}