import * as Bun from "bun";

function getSymbols() {
    const symbols = []
    for (let i = 0; i <= 127; i++) {
        if (i === 46) continue;
        if (i === 10) continue;
        if (
            (i >= 0 && i <= 31) ||
            (i >= 33 && i <= 47) ||
            (i >= 58 && i <= 64) ||
            (i >= 91 && i <= 96) ||
            (i >= 123 && i <= 127)
        ) {
            symbols.push(i)
        }
    }
    return symbols
}

const ALL_SYMBOLS_WITHOUT_DOT = getSymbols()

function splitByUnicode10(array: number[]) {
    const result = []
    let currentSubArray = []

    for (const codePoint of array) {
        if (codePoint === 10) {
            result.push(currentSubArray)
            currentSubArray = []
        } else {
            currentSubArray.push(codePoint)
        }
    }

    if (currentSubArray.length > 0) {
        result.push(currentSubArray)
    }

    return result
}

function constructNumbers(
    direction: 'left' | 'right',
    array: number[],
    index: number
) {
    const chars = []
    if (direction === 'left') {
        const subArray = array.slice(0, index)
        const lastIndexOfSymbol = subArray.findLastIndex(
            char => ALL_SYMBOLS_WITHOUT_DOT.includes(char) || char === 46
        )
        if (lastIndexOfSymbol > -1) {
            chars.push(...subArray.slice(lastIndexOfSymbol + 1, undefined))
        } else {
            chars.push(...subArray)
        }
    } else {
        const rest = array.slice(index + 1)
        for (const char of rest) {
            if (ALL_SYMBOLS_WITHOUT_DOT.includes(char) || char === 46) {
                break
            }
            chars.push(char)
        }
    }

    return chars
        .map(n => String.fromCharCode(n))
        .reduce((acc, curr) => acc + curr, '')
}

const ZERO_ASCII = 48
const NINE_ASCII = 57

function isNumber(array: number[], index: number) {
    const c = array.at(index)
    if (!c) return false
    return c >= ZERO_ASCII && c <= NINE_ASCII
}

function extractLeft(line: number[], start: number): string {
    if (start < 0 || start >= line.length) return '';
    const curr = line.at(start);
    if (!curr) return '';
    if (ALL_SYMBOLS_WITHOUT_DOT.includes(curr) || curr === 46) return '';
    return extractLeft(line, start - 1) + String.fromCharCode(curr!);
}

function extractRight(line: number[], start: number): string {
    if (start < 0 || start >= line.length) return '';
    const curr = line.at(start);
    if (!curr) return '';
    if (ALL_SYMBOLS_WITHOUT_DOT.includes(curr) || curr === 46) return '';
    return String.fromCharCode(curr!) + extractRight(line, start + 1);
}

function extractContinious(line: number[], start: number): string {
    if (start < 0 || start >= line.length) return '';
    const curr = line.at(start);
    if (!curr) return '';
    if (ALL_SYMBOLS_WITHOUT_DOT.includes(curr) || curr === 46) return '';
    return extractLeft(line, start - 1) + String.fromCharCode(curr!) + extractRight(line, start + 1);
}

export async function partOne(file: Bun.file) {
    const engineParts: number[] = []
    const stream = file.stream()
    for await (const chunk of stream) {
        const lines = splitByUnicode10(chunk)
        for (const [lineIndex, line] of lines.entries()) {
            const lineLength = line.length
            for (const [charIndex, char] of line.entries()) {
                if (ALL_SYMBOLS_WITHOUT_DOT.includes(char)) {
                    // search adjacent numbers
                    const previousLine = lines.at(lineIndex - 1)
                    let isCenterPreviousLine = false;
                    if (previousLine) {
                        if (isNumber(previousLine, charIndex)) {
                            engineParts.push(Number(extractContinious(previousLine, charIndex)));
                            isCenterPreviousLine = true;
                        }
                        if (!isCenterPreviousLine) {
                            if (charIndex > 0) {
                                if (isNumber(previousLine, charIndex - 1)) {
                                    engineParts.push(Number(extractContinious(previousLine, charIndex - 1)));
                                }
                            }
                            if (charIndex < lineLength - 1) {
                                if (isNumber(previousLine, charIndex + 1)) {
                                    engineParts.push(Number(extractContinious(previousLine, charIndex + 1)));
                                }
                            }
                        }
                    }
                    const nextLine = lines.at(lineIndex + 1);
                    let isCenterNextLine = false;
                    if (nextLine) {
                        if (isNumber(nextLine, charIndex)) {
                            engineParts.push(Number(extractContinious(nextLine, charIndex)));
                            isCenterNextLine = true;
                        }
                        if (!isCenterNextLine) {
                            if (charIndex > 0) {
                                if (isNumber(nextLine, charIndex - 1)) {
                                    engineParts.push(Number(extractContinious(nextLine, charIndex - 1)));
                                }
                            }
                            if (charIndex < lineLength - 1) {
                                if (isNumber(nextLine, charIndex + 1)) {
                                    engineParts.push(Number(extractContinious(nextLine, charIndex + 1)));
                                }
                            }
                        }
                    }
                    // LEFT
                    if (isNumber(line, charIndex - 1)) {
                        // push all numbers to the left
                        engineParts.push(Number(constructNumbers('left', line, charIndex)))
                    }
                    // RIGHT
                    if (isNumber(line, charIndex + 1)) {
                        engineParts.push(Number(constructNumbers('right', line, charIndex)))
                    }
                }
            }
        }
    }
    return (engineParts.reduce((acc, curr) => acc + curr, 0));
}

export async function partTwo(file: Bun.file) {
    const gears: number[] = []
    const stream = file.stream()
    for await (const chunk of stream) {
        const lines = splitByUnicode10(chunk)
        for (const [lineIndex, line] of lines.entries()) {
            const lineLength = line.length;
            const adjacentNumbers: number[] = []
            for (const [charIndex, char] of line.entries()) {
                if (ALL_SYMBOLS_WITHOUT_DOT.includes(char)) {
                    // search adjacent numbers
                    const previousLine = lines.at(lineIndex - 1)
                    let isCenterPreviousLine = false;
                    if (previousLine) {
                        if (isNumber(previousLine, charIndex)) {
                            adjacentNumbers.push(Number(extractContinious(previousLine, charIndex)));
                            isCenterPreviousLine = true;
                        }
                        if (!isCenterPreviousLine) {
                            if (charIndex > 0) {
                                if (isNumber(previousLine, charIndex - 1)) {
                                    adjacentNumbers.push(Number(extractContinious(previousLine, charIndex - 1)));
                                }
                            }
                            if (charIndex < lineLength - 1) {
                                if (isNumber(previousLine, charIndex + 1)) {
                                    adjacentNumbers.push(Number(extractContinious(previousLine, charIndex + 1)));
                                }
                            }
                        }
                    }
                    const nextLine = lines.at(lineIndex + 1);
                    let isCenterNextLine = false;
                    if (nextLine) {
                        if (isNumber(nextLine, charIndex)) {
                            adjacentNumbers.push(Number(extractContinious(nextLine, charIndex)));
                            isCenterNextLine = true;
                        }
                        if (!isCenterNextLine) {
                            if (charIndex > 0) {
                                if (isNumber(nextLine, charIndex - 1)) {
                                    adjacentNumbers.push(Number(extractContinious(nextLine, charIndex - 1)));
                                }
                            }
                            if (charIndex < lineLength - 1) {
                                if (isNumber(nextLine, charIndex + 1)) {
                                    adjacentNumbers.push(Number(extractContinious(nextLine, charIndex + 1)));
                                }
                            }
                        }
                    }
                    // LEFT
                    if (isNumber(line, charIndex - 1)) {
                        // push all numbers to the left
                        adjacentNumbers.push(Number(constructNumbers('left', line, charIndex)))
                    }
                    // RIGHT
                    if (isNumber(line, charIndex + 1)) {
                        adjacentNumbers.push(Number(constructNumbers('right', line, charIndex)))
                    }
                    if(adjacentNumbers.length > 1) {
                        gears.push(adjacentNumbers.reduce((acc, curr) => acc * curr, 1))
                    }
                }
                else {
                    adjacentNumbers.length = 0;
                }
            }
        }
    }
    return (gears.reduce((acc, curr) => acc + curr, 0));
}

export function parse(path: string) {
    return Bun.file(path)
}
