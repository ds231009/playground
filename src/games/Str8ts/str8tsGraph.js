const initialBoard = [
    [null, null, 0, 3, null, 0, null, null, 0],
    [null, null, null, null, null, null, null, null, null],
    [9, null, null, 0, 4, null, null, 0, null],
    [-3, 0, null, null, 0, null, null, 0, 0],
    [null, null, null, null, null, -1, null, null, null],
    [null, null, null, null, null, null, 0, null, 3],
    [null, 6, 0, null, null, null, 0, null, 0],
    [0, 0, null, null, null, 7, null, null, -9],
    [null, null, null, null, null, 0, -8, null, null],
];

const universalSet = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

export class Str8tsGraph {
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
                let initialValue = initialBoard[row][col]
                const id = `${row}-${col}`;

                let peers = new Set()

                let sameStreet = true
                for (let findCol = col + 1; findCol < 9; findCol++) {
                    const cell = initialBoard[row][findCol];
                    if (initialValue > 0 || initialValue === null) {
                        if (sameStreet && (cell === null || cell > 0)) {
                            peers.add({id: `${row}-${findCol}`, relation: "streetRow"});
                        } else {
                            peers.add({id: `${row}-${findCol}`, relation: "row"});
                            sameStreet = false;
                        }
                    }
                }

                sameStreet = true
                for (let findCol = col - 1; findCol >= 0; findCol--) {
                    const cell = initialBoard[row][findCol];
                    if (initialValue > 0 || initialValue === null) {
                        if (sameStreet && (cell === null || cell > 0)) {
                            peers.add({id: `${row}-${findCol}`, relation: "streetRow"});
                        } else {
                            peers.add({id: `${row}-${findCol}`, relation: "row"});
                            sameStreet = false;
                        }
                    }
                }

                sameStreet = true
                for (let findRow = row + 1; findRow < 9; findRow++) {
                    const cell = initialBoard[findRow][col];
                    if (initialValue > 0 || initialValue === null) {
                        if (sameStreet && (cell === null || cell > 0)) {
                            peers.add({id: `${findRow}-${col}`, relation: "streetCol"});
                        } else {
                            peers.add({id: `${findRow}-${col}`, relation: "col"});
                            sameStreet = false;
                        }
                    }
                }

                sameStreet = true
                for (let findRow = row - 1; findRow >= 0; findRow--) {
                    const cell = initialBoard[findRow][col];
                    if (initialValue > 0 || initialValue === null) {
                        if (sameStreet && (cell === null || cell > 0)) {
                            peers.add({id: `${findRow}-${col}`, relation: "streetCol"});
                        } else {
                            peers.add({id: `${findRow}-${col}`, relation: "col"});
                            sameStreet = false;
                        }
                    }
                }

                this.nodes.set(id, {
                    id,
                    position: { row, col },
                    peers: Array.from(peers),

                    initial: typeof (initialValue) === "number",

                    value: typeof (initialValue) === "number" ? initialValue : null,
                    candidates: [],

                    machineValue: typeof (initialValue) === "number" ? initialValue : null,
                    machineCandidates: [],

                    isHighlighted: false,
                    state: typeof (initialValue) !== "number" ? null : initialValue <= 0 ? "blocked" : "initial",
                });

                this.callstack.push({id: `${row}-${col}`, relation: null});
            }
        }

        console.log(this.nodes)
        this.callstack.sort()
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
            if (cell && cell.machineValue === null) {
                break;
            }
        }
        console.log("Machine is analyzing cell:", cell, this.callstack);
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
            "streetRow": [],
            "streetCol": [],
        };
        for (let peer of cell.peers) {
            const peerValue = Math.abs(this.nodes.get(peer.id).machineValue);
            const peerCandidates = this.nodes.get(peer.id).machineCandidates || [];
            const peerRelation = peer.relation;
            if (peerValue) machineNotCandidates.add(peerValue);
            if (peerCandidates && (!peerValue) && peerCandidates?.length > 0) machinePeersCandidates[peerRelation].push(peerCandidates);
        }

        let machinePeersCandidatesMap = {
            "row": null,
            "col": null,
            "streetRow": null,
            "streetCol": null
        }
        machinePeersCandidatesMap["row"] = this.findOverlapGroup(machinePeersCandidates["row"])
        machinePeersCandidatesMap["col"] = this.findOverlapGroup(machinePeersCandidates["col"])
        machinePeersCandidatesMap["streetRow"] = this.findOverlapGroup(machinePeersCandidates["streetRow"])
        machinePeersCandidatesMap["streetCol"] = this.findOverlapGroup(machinePeersCandidates["streetCol"])

        if (machinePeersCandidatesMap["row"].size > 0 ||
            machinePeersCandidatesMap["col"].size > 0 ||
            machinePeersCandidatesMap["streetRow"].size > 0 ||
            machinePeersCandidatesMap["streetCol"].size > 0) console.log("Machine Peers Candidates:",machinePeersCandidates, machinePeersCandidatesMap);

        let possibleCandidates = universalSet
            .difference(machineNotCandidates)
            .difference(machinePeersCandidatesMap["row"])
            .difference(machinePeersCandidatesMap["col"])
            .difference(machinePeersCandidatesMap["streetRow"])
            .difference(machinePeersCandidatesMap["streetCol"]);

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