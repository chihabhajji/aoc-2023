const COLORS = ['red', 'blue', 'green'] as const
type MappedColors = Map<(typeof COLORS)[number], number>

function extractNumberColorPairs(string: string): MappedColors {
    const [gamePrefix, ...allBags] = string.split(':');
    const gameId = (Number(gamePrefix.split('Game ').at(1)));
    const bags = allBags.at(0).split(';');
    const skkk = [];
    for (const [index, bag] of bags.entries()) {
        const regex = /\d+\s+(?:red|blue|green)/g;
        const pairs = Array.from(bag.matchAll(regex)).map(v => v[0]).map(v => {
            const [count, color] = v.split(' ');
            return {[color]: Number(count)} as const;
        }).reduce((acc, curr) => {
            const [color, count] = Object.entries(curr).at(0)!;
            acc.set(color, count);
            return acc;
        }, new Map<(typeof COLORS)[number], number>());
        skkk.push(pairs);
    }
    return [gameId, skkk];
}


export async function partOne(stream: ReadableStream) {
    let res = 0
    for await (const chunk of stream) {
        const buffer = Buffer.from(chunk)
        const lines = buffer.toString('utf8').split('\n')
        for (const line of lines) {
            const [gameId, bags] = extractNumberColorPairs(line)
            let skip = false;
            for (const [index, bag] of bags.entries()) {
                for (const [color, count] of bag.entries()) {
                    if (color === 'red' && count > 12) {
                        skip = true;
                        break;
                    } else if (color === 'green' && count > 13) {
                        skip = true;
                        break;
                    } else if (color === 'blue' && count > 14) {
                        skip = true;
                        break;
                    }
                }
            }
            if (skip) {
                skip = false;
                continue;
            } else {
                res += gameId;
            }
        }
    }
    return res;
}

export async function partTwo(stream: ReadableStream) {
    let res = 0
    for await (const chunk of stream) {
        const buffer = Buffer.from(chunk)
        const lines = buffer.toString('utf8').split('\n')
        for (const line of lines) {
            const [gameId, bags] = extractNumberColorPairs(line)
            const max = COLORS
                .map(color =>
                    bags.map(v => v.get(color))
                        .filter(v => v !== undefined)
                        .reduce((acc, curr) => Math.max(acc, curr), 0));
           const power = max.reduce((acc, curr) => acc * curr, 1);
            res += power;
        }
    }
    return res;
}

export function parse(path: string) {
    const file = Bun.file(path)
    return file.stream()
}
