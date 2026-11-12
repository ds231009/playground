export async function getWord(solutionLength) {
    var data = await getData(solutionLength);
    if (!data) return null;

    data = data.filter(w => w.tags[0].substring(2,14) > 1);

    const randomIndex = Math.floor(Math.random() * data.length);
    const randomWord = data[randomIndex].word.toLocaleUpperCase();

    return randomWord;
    // return "GREEN"
}

export async function getData(solutionLength) {
    const characters = "abcdefghijklmnopqrstuvwxyz"

    const randomInd = Math.floor(Math.random() * characters.length);
    let char = characters.charAt(randomInd);

    const url = `https://api.datamuse.com/words?max=99&sp=${char}${"?".repeat(solutionLength - 1)}&md=f`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result
    } catch (error) {
        console.error(error.message);
    }
}

export function enteredWord(word, solution, solutionLength) {
    let tempSolution = [...solution]
    let result = [];
    let gameOver = false;


    for (let i = 0; i < solutionLength; i++) {
        if (word[i].letter === tempSolution[i]) {
            result.push({id: i, char: word[i].letter, status: "true"});
            tempSolution[i] = null
            word[i].letter = null
        };
    }

    if (result.length === solutionLength) gameOver = true;

    tempSolution = new Set(tempSolution)

    for (let i = 0; i < solutionLength; i++) {
        if (!word[i].letter) continue
        if (tempSolution.has(word[i].letter)) {
            result.push({id: i, char: word[i].letter, status: "candid"});
            tempSolution.delete(word[i].letter)
            word[i].letter = null
        }
        else {
            result.push({id: i, char: word[i].letter, status: "wrong"});
            tempSolution.delete(word[i].letter)
            word[i].letter = null
        }
    }
    return [result, gameOver];
}

export function createKeyboardLayout(letters) {
    const rowLengths = [10, 9, 7];
    let start = 0;

    return rowLengths.map(length => {
        const row = letters.slice(start, start + length);
        start += length;

        return row.map(letter => ({
            letter,
            status: "unseen"
        }));
    });
}
