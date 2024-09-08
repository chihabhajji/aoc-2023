import { BunFile, indexOfLine } from 'bun'

const SPACE = ' '.charCodeAt(0)
const BAR = '|'.charCodeAt(0)
const LINE_BREAK = '\n'.charCodeAt(0)
const COLON = ':'.charCodeAt(0)
const CARD = 'Card'

function splitBySpace(array: Uint8Array) {
  const result: { bag: number[]; hand: number[] }[] = []
  let currentSubArray = []

  for (const codePoint of array) {
    if (codePoint === LINE_BREAK) {
      const barLocation = currentSubArray.indexOf(BAR)
      const bagWithPrefix = currentSubArray.slice(0, barLocation - 1)
      const gameIdDelimiter = bagWithPrefix.indexOf(COLON)
      const hand = currentSubArray.slice(barLocation + 2)
      const bag = bagWithPrefix.slice(gameIdDelimiter + 2)

      result.push({
        hand,
        bag
      })
      currentSubArray = []
    } else {
      currentSubArray.push(codePoint)
    }
  }

  return result
}

export async function partOne(file: BunFile) {
  const stream = file.stream()

  let sum = 0
  for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
    const lines = splitBySpace(chunk)
    for (const line of lines) {
      const handPulls = line.hand
      const bagPulls = line.bag

      const items = []
      for (let i = 0; i < bagPulls.length; i += 3) {
        const firstPart = bagPulls.at(i)!
        const secondPart = bagPulls.at(i + 1)!
        for (let j = 0; j < handPulls.length; j += 3) {
          if (handPulls.at(j) !== firstPart) {
            continue
          }
          if (handPulls.at(j + 1) === secondPart) {
            const num = Number(
              String.fromCharCode(handPulls[j]!) +
                String.fromCharCode(handPulls[j + 1]!)
            )
            items.push(num)
            break
          }
        }
      }

      if (items.length > 0) {
        sum += Math.pow(2, items.length - 1)
      }
    }
  }
  return sum
}

export async function partTwo(file: BunFile) {
  const stream = file.stream()
  for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
    const lines = splitBySpace(chunk)
    const copies = Array(lines.length).fill(1)
    for (const [lineIndex, line] of lines.entries()) {
      const handPulls = line.hand
      const bagPulls = line.bag

      const items = []
      for (let i = 0; i < bagPulls.length; i += 3) {
        const firstPart = bagPulls[i]
        const secondPart = bagPulls[i + 1]
        for (let j = 0; j < handPulls.length; j += 3) {
          if (handPulls.at(j) !== firstPart) {
            continue
          }
          if (handPulls.at(j + 1) === secondPart) {
            const num = Number(
              String.fromCharCode(handPulls[j]!) +
                String.fromCharCode(handPulls[j + 1]!)
            )
            items.push(num)
            break
          }
        }
      }

      for (let ci = 1; ci <= items.length; ci++) {
        copies[lineIndex + ci] = copies[lineIndex + ci] + copies[lineIndex]
      }
    }
    return copies.reduce((acc, cc) => acc + cc)
  }
}

export function parse(path: string) {
  return Bun.file(path)
}
