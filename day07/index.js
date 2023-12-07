import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day07');

if (process.argv[2])
{
  day07(process.argv[2]).then(console.log);
}

function value(card)
{
  const values = {
    2: '2', 3: '3', 4: '4', 5: '5',
    6: '6', 7: '7', 8: '8', 9: '9',
    T: 'A', J: 'B', Q: 'C', K: 'D',
    A: 'E'
  };
  return values[card];
}

function frequencies(hand)
{
  const m = hand
    .split('')
    .reduce((m, v) => { m.set(v, m.has(v) ? m.get(v) + 1 : 1); return m; },
      new Map());

  return new Map([ ...m ].sort((v1, v2) => v2[1] - v1[1]));
}

function compare(hand1, hand2)
{
  const n1 = Array.from(frequencies(hand1).values());
  const n2 = Array.from(frequencies(hand2).values());

  if (n1 > n2)
  {
    return 1;
  }
  if (n1 < n2)
  {
    return -1;
  }
  return hand1.split('').map(v => value(v)) > hand2.split('').map(v => value(v)) ? 1 : -1;
}

function solve1(data)
{
  const order = data
    .map(v => v.split(' ')).map(v => [ v[0], parseInt(v[1], 10) ])
    .sort((v1, v2) => compare(v1[0], v2[0]));

  const res = order
    .reduce((a, v, i) => a + (i + 1) * v[1], 0);

  return res;
}

function solve2()
{
  return 'todo';
}

export default async function day07(target)
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
  const expect1 = 6440;
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

  return { day: 'day07', part1, part2, duration: Date.now() - start };
}
