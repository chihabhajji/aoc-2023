function splitByUnicode10(array: number[]) {
  const result = []
  let currentSubArray = []

  for (const codePoint of array) {
    if (codePoint === 10) {
      result.push(currentSubArray)
      currentSubArray = []
    } else if (codePoint >= 48 && codePoint <= 57) {
      currentSubArray.push(codePoint)
    }
  }

  if (currentSubArray.length > 0) {
    result.push(currentSubArray)
  }

  return result
}
const digits = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine'
]

const crossOver = () => {
  const redundant = new Map<string, string>()
  for (const [index, digit] of digits.entries()) {
    const endsWith = digits.filter(s => s.at(-1) === digit.at(0))
    if (endsWith?.length === 0) continue
    for (const ends of endsWith) {
      const match = `${ends}${digit.substring(1)}`
      if (!redundant.has(match)) {
        const replace = `${digits.indexOf(ends)}${index}`
        redundant.set(match, replace)
      }
    }
  }
  return redundant
}
function splitByLine(array: number[]) {
  const buffer = Buffer.from(array)
  let string = buffer.toString('utf8')
  const redundant = crossOver()
  for (const [key, value] of redundant.entries()) {
    string = string.replaceAll(key, value)
  }
  for (const [index, digit] of digits.entries()) {
    string = string.replaceAll(digit, index.toString())
  }

  return string.split('\n')
}

export async function partOne(stream: ReadableStream) {
  let result = 0
  for await (const chunk of stream) {
    for (const unicodeArray of splitByUnicode10(chunk)) {
      const first = (unicodeArray?.at(0)! - 48) * 10
      const second = unicodeArray?.at(-1)! - 48
      result += first + second
    }
  }
  return result
}

export async function partTwo(stream: ReadableStream) {
  let result = 0
  for await (const chunk of stream) {
    for (const string of splitByLine(chunk)) {
      if (string.trim().length === 0) continue
      const matched = string.matchAll(/\d/g)
      const numbers = Array.from(matched).map(v => Number(v.at(0)))
      const first = numbers.at(0)
      const second = numbers.at(-1)

      if (first && !Number.isNaN(first) && second && !Number.isNaN(second)) {
        const acc = first * 10 + second
        result += acc
      }
    }
  }
  return result
}

export function parse(path: string) {
  const file = Bun.file(path)
  return file.stream()
}
