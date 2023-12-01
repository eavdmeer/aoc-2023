import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day01');

if (process.argv[2])
{
  day01(process.argv[2]).then(console.log);
}

function solve1(data)
{
  return data
    .map(v => v.replace(/[^0-9]/g, ''))
    .map(v => parseInt(`${v[0]}${v[v.length - 1]}`, 10))
    .reduce((a, v) => a + v, 0);
}

function firstLast(str)
{
  const map = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9
  };

  const search = [ ...Object.keys(map), ...Object.values(map) ];

  const first = {};
  search.forEach(v =>
  {
    const idx = str.indexOf(v);
    if (idx >= 0 && (first.idx === undefined || idx < first.idx))
    {
      first.idx = idx;
      first.val = map[v] ?? v;
    }
  });
  const last = {};
  search.forEach(v =>
  {
    const idx = str.lastIndexOf(v);
    if (idx >= 0 && (last.idx === undefined || idx > last.idx))
    {
      last.idx = idx;
      last.val = map[v] ?? v;
    }
  });

  return 10 * first.val + last.val;
}

function solve2(data)
{
  return data
    .map(v => firstLast(v))
    .reduce((a, v) => a + v, 0);
}

export default async function day01(target)
{
  const start = Date.now();
  debug('starting');

  const buffer = await fs.readFile(target);

  /* eslint-disable no-shadow */
  const data = buffer
    .toString()
    .trim()
    .split(/\s*\n\s*/);
  /* eslint-enable no-shadow */

  debug('data', data);

  const part1 = solve1(data);
  if (target.includes('example1') && part1 !== 142)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; 142`);
  }

  const part2 = solve2(data);
  debug('part2', part2);
  if (target.includes('example2') && part2 !== 281)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; 281`);
  }

  return { day: 1, part1, part2, duration: Date.now() - start };
}
