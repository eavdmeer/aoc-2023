import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day02');

if (process.argv[2])
{
  day02(process.argv[2]).then(console.log);
}

function solve1(data)
{
  const max = { red: 12, green: 13, blue: 14 };

  return data
    .map((line, i) =>
    {
      const d = line.replace(/^.*:\s*/, '');
      const it = d.matchAll(/(\d+) (red|green|blue)/g);
      for (const match of it)
      {
        if (parseInt(match[1], 10) > max[match[2]])
        {
          return 0;
        }
      }
      return i + 1;
    })
    .reduce((a, v) => a + v, 0);
}

function solve2(data)
{
  return data
    .map(line =>
    {
      const d = line.replace(/^.*:\s*/, '');
      const it = d.matchAll(/(\d+) (red|green|blue)/g);
      const min = { red: 0, green: 0, blue: 0 };
      for (const match of it)
      {
        const cnt = parseInt(match[1], 10);
        if (cnt > min[match[2]])
        {
          min[match[2]] = cnt;
        }
      }
      return min.red * min.green * min.blue;
    })
    .reduce((a, v) => a + v, 0);
}

export default async function day02(target)
{
  const start = Date.now();
  debug('starting');

  const buffer = await fs.readFile(target);

  /* eslint-disable no-shadow */
  const data = buffer
    .toString()
    .trim()
    .split(/\s*\n\s*/)
    .filter(v => v);
  /* eslint-enable no-shadow */

  debug('data', data);

  const part1 = solve1(data);
  const expect1 = 8;
  if (target.includes('example') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 2286;
  if (target.includes('example') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 2, part1, part2, duration: Date.now() - start };
}
