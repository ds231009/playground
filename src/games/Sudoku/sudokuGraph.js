// const initionalBoard = [
//     [5, 3, null, null, 7, null, null, null, null],
//     [6, null, null, 1, 9, 5, null, null, null],
//     [null, 9, 8, null, null, null, null, 6, null],
//     [8, null, null, null, 6, null, null, null, 3],
//     [4, null, null, 8, null, 3, null, null, 1],
//     [7, null, null, null, 2, null, null, null, 6],
//     [null, 6, null, null, null, null, 2, 8, null],
//     [null, null, null, 4, 1, 9, null, null, 5],
//     [null, null, null, null, 8, null,null ,7, 9]
// ]

const initionalBoard = [
    [null, null, 3, 4, 9, null, null, null, null],
    [5, null, 8, null, null, null, null, 7, null],
    [6, null, null, null, 8, 2, null, 3, null],
    [null, null, 6, null, null, 9, null, null, null],
    [null, null, null, 5, 1, null, null, 4, null],
    [null, null, null, null, null, 4, 8, null, null],
    [null, null, null, null, null, null, null, null, null],
    [1, 2, null, null, null, null, null, null, 9],
    [null, null, 7, null, 3, null, 2, null, 8],
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// const initionalBoard = [
//     [null, null, null, null, null, null, 1, 7, 4],
//     [null, null, null, 8, 2, null, null, null, 6],
//     [null, null, null, 3, null, null, null, null, 8],
//     [null, 8, null, null, null, null, 5, null, null],
//     [null, null, 2, 9, null, 5, null, null, null],
//     [null, null, 6, null, null, null, null, 1, null],
//     [1, null, null, null, 4, null, 6, null, 7],
//     [null, null, null, null, 7, null, null, null, null],
//     [4, 7, null, null, null, 8, null, null, null],
// ];

const universalSet = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

export class SudokuGraph {
    constructor() {
        this.nodes = new Map();
        this.callstack = [];
        this.history = [];
        this.states = {
            user: "solving",
            machine: "solving",
        }
        this.stats = {
            machineSteps: 0,
            machineGuesses: 0,
        }
    }

    initializeBoard() {
        this.nodes.clear();
        this.callstack = [];

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                let initialValue = initionalBoard[row][col]
                const id = `${row}-${col}`;

                let peers = new Set()
                for (let i = 0; i < 9; i++) {
                    if (i !== col) peers.add({id: `${row}-${i}`, relation: "row"});
                    if (i !== row) peers.add({id: `${i}-${col}`, relation: "col"});
                }
                const boxStartRow = Math.floor(row / 3) * 3;
                const boxStartCol = Math.floor(col / 3) * 3;

                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        const peerRow = boxStartRow + r;
                        const peerCol = boxStartCol + c;
                        if (!(peerRow === row && peerCol === col)) {
                            peers.add({id: `${peerRow}-${peerCol}`, relation: "square"});
                        }
                    }
                }

                this.nodes.set(id, {
                    id,
                    position: { row, col },
                    peers: Array.from(peers),

                    initial: initialValue > 0,

                    value: initialValue ? initialValue : null,
                    candidates: [],

                    machineValue: initialValue ? initialValue : null,
                    machineCandidates: [],

                    isHighlighted: false,
                    state: initialValue ? "initial" : "empty"
                });

                this.callstack.push({id: `${row}-${col}`, relation: null});
            }
        }
        this.callstack.sort()
        console.log(this.nodes);
        console.log(this.callstack);
    }

    handleNumberInput(activeCellID, number, isCandidMode) {
        if (this.nodes.get(activeCellID).initial) return
        console.log(isCandidMode);
        if (!(number)) {
            this.nodes.get(activeCellID).value = null;
            this.nodes.get(activeCellID).candidates = [];
            console.log(`Cleared cell:`, this.nodes.get(activeCellID));
            return;
        }

        if (isCandidMode) {
            this.nodes.get(activeCellID).value = null;
            if (!this.nodes.get(activeCellID).candidates.includes(number)) {
                this.nodes.get(activeCellID).candidates.push(number);
            } else {
                this.nodes.get(activeCellID).candidates = this.nodes.get(activeCellID).candidates.filter(n => n !== number);
            }
            console.log(`Placed ${number} in candidates:`, this.nodes.get(activeCellID));

        } else {
            this.nodes.get(activeCellID).value = number;
            console.log(`Placed ${number} in cell:`, this.nodes.get(activeCellID));
        }
    }


    makeMachineStep = () => {
        if (this.states.machine === "solved") return

        this.stats.machineSteps++;

        let cellID;
        let cell;
        while (this.callstack.length > 0) {
            cellID = this.callstack.pop().id;
            cell = this.nodes.get(cellID);

            // If we find an empty cell, just STOP popping and proceed to the math!
            if (cell && !cell.machineValue) {
                break;
            }
        }

        // After the loop finishes, check WHY it finished.
        // If the callstack ran out completely, THEN it is time to guess.
        if (!cell || cell.machineValue) {
            console.log("No empty cells found in the callstack. Time to guess.");
            this.makeGuess();
            return;
        }

        let machineNotCandidates = new Set();
        let machinePeersCandidates = {
            "row": [],
            "col": [],
            "square": []
        };
        for (let peer of cell.peers) {
            const peerValue = this.nodes.get(peer.id).machineValue;
            const peerCandidates = this.nodes.get(peer.id).machineCandidates || [];
            const peerRelation = peer.relation;
            if (peerValue) machineNotCandidates.add(peerValue);
            if (peerCandidates && (!peerValue) && peerCandidates.length > 0) machinePeersCandidates[peerRelation].push(peerCandidates);
        }

        let machinePeersCandidatesMap = {
            "row": null,
            "col": null,
            "square": null
        }
        machinePeersCandidatesMap["row"] = this.findOverlapGroup(machinePeersCandidates["row"])
        machinePeersCandidatesMap["col"] = this.findOverlapGroup(machinePeersCandidates["col"])
        machinePeersCandidatesMap["square"] = this.findOverlapGroup(machinePeersCandidates["square"])
        if (machinePeersCandidatesMap["row"].size > 0 || machinePeersCandidatesMap["col"].size > 0 || machinePeersCandidatesMap["square"].size > 0) console.log("Machine Peers Candidates:",machinePeersCandidates, machinePeersCandidatesMap);

        let possibleCandidates = universalSet
            .difference(machineNotCandidates)
            .difference(machinePeersCandidatesMap["row"])
            .difference(machinePeersCandidatesMap["col"])
            .difference(machinePeersCandidatesMap["square"]);

        // Fill cell with only candidate left
        if (possibleCandidates.size === 1) {
            const [soleCandidate] = possibleCandidates;
            cell.machineValue = soleCandidate;

            console.log(cell, this.history)
            cell.state = this.history.length === 0 ? "machine-solved" : "machine-guessed";

            console.log(`Machine placed ${soleCandidate} in cell ${cellID}`);

            cell.peers = cell.peers.sort()
            this.callstack.push(...cell.peers);
        } else if (possibleCandidates.size === 0) {
            this.backtrack()
            return
        } else {
            cell.machineCandidates = Array.from(possibleCandidates);
        }
    }

    findOverlapGroup = (ranges) => {
        let components = new Set()

        if (!(ranges)) return components;
        if (ranges.length === 0) return components;
        for (let range of ranges) {
            if (!(range)) continue
            let size = range.length
            let rangeA = new Set(range);
            let subsetsFound = 0;

            for (let rangeToCompare of ranges) {
                if (range === rangeToCompare) continue;
                let rangeB = new Set(rangeToCompare);

                if (rangeA.isSupersetOf(rangeB)) {
                    subsetsFound++;
                }
            }

            if (subsetsFound + 1 === size) {
                range.forEach(value => components.add(value));
            }
        }

        return components;
    }

    findLowestCandidateCell = () => {
        let lowestCandidateCell = null
        this.nodes.forEach((node) => {
            if (node.machineValue) return;
            if (!lowestCandidateCell || node.machineCandidates.length < lowestCandidateCell.machineCandidates.length) {
                lowestCandidateCell = node;
            }
        })

        return lowestCandidateCell
    }

    makeGuess = () => {
        const cell = this.findLowestCandidateCell();
        console.log(cell)
        if (!cell) {
            console.log("🎉 PUZZLE SOLVED! 🎉");
            this.states.machine = "solved"
            return;
        }

        if (cell.machineCandidates.length === 0) {
            console.log(`Cell ${cell.id} is out of candidates! Backtracking further...`);
            this.backtrack();
            return; // Stop this guess, let the backtrack handle it
        }

        this.stats.machineGuesses++;

        const guessedValue = cell.machineCandidates.shift();

        this.saveHistory(cell.id)

        cell.machineValue = guessedValue
        console.log(cell, this.history)
        cell.state = this.history.length === 0 ? "machine-solved" : "machine-guessed";

        cell.peers = cell.peers.sort()
        this.callstack.push(...cell.peers);

        console.log(`Machine guessed ${cell.machineValue} in cell`, cell, this.history);
    }

    saveHistory = (entryID) => {
        let nodeChanges = Array.from(structuredClone(this.nodes))
        console.log("NODE CHANGES", nodeChanges);
        this.history.push({cellID: entryID, version: nodeChanges, versionCallstack: structuredClone(this.callstack)});
    }

    makeNextNMachineStep = (n) => {
            for (let i = 0; i < n; i++) {
                this.makeMachineStep()
            }
    }

    runUntilSolved = async (updateUICallback, stoppingCallback, delayMs = 50) => {
        let safetyCounter = 0; // The Emergency Brake

        // Keep running ONLY if it is still actively solving
        while (this.states.machine === "solving" && stoppingCallback.current) {
            safetyCounter++;

            // If it takes more than 5,000 steps, something is wrong. Stop!
            if (safetyCounter > 5000) {
                console.error("Emergency Brake Pulled! Infinite loop prevented.");
                break;
            }

            this.makeMachineStep();
            updateUICallback();

            // The word 'await' is mandatory here!
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        console.log("Runner stopped. Final stats:", this.stats.machine);
    }

    backtrack = () => {
        if (this.history.length === 0) {
            console.log("No more history to backtrack!");
            return;
        }

        const lastState = this.history.pop();
        this.callstack = lastState.versionCallstack;
        this.nodes = new Map(lastState.version);
        console.log("Backtracked to previous state:", this.nodes, lastState);
    }
}