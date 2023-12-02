import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('dayxx');

if (process.argv[2])
{
  dayxx(process.argv[2]).then(console.log);
}

function solve1()
{
  return 'todo';
}

function solve2()
{
  return 'todo';
}

export default async function dayxx(target)
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
  const expect1 = 'todo';
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 'todo';
  if (target.includes('example2') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'dayxx', part1, part2, duration: Date.now() - start };
}
