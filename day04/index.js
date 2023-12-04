import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day04');

const useHyperNeutrino = false;

if (process.argv[2])
{
  day04(process.argv[2]).then(console.log);
}

function intersect(a, b)
{
  const setA = new Set(a);
  const setB = new Set(b);

  const intersection = new Set([ ...setA ].filter(x => setB.has(x)));

  return Array.from(intersection);
}

function solve1(data)
{
  return data
    .map(v => v.replace(/^.*: /, '').split(/\s*\|\s*/))
    .map(([ w, m ]) => intersect(w.split(/\s+/), m.split(/\s+/)))
    .map(v => v.length > 0 ? Math.pow(2, v.length - 1) : 0)
    .reduce((a, v) => a + v, 0);
}

const cache = new Map();

function getPrize(card, scores)
{
  const key = `${card}-${scores[card]}`;

  if (cache.has(key))
  {
    return cache.get(key);
  }

  let res = 1;
  for (let i = card + 1; i < card + 1 + scores[card]; i++)
  {
    res += getPrize(i, scores);
  }

  cache.set(key, res);

  return res;
}

function hyperNeutrino2(data)
{
  const m = new Map();
  data
    .map(v => v.split(/\s*[|:]\s*/))
    .map(v => intersect(v[1].split(/\s+/), v[2].split(/\s+/)).length)
    .forEach((j, i) =>
    {
      if (! m.has(i)) { m.set(i, 1); }
      for (let n = i + 1; n < i + j + 1; n++)
      {
        m.set(n, m.get(i) + (m.get(n) ?? 1));
      }
    });
  return Array.from(m.values()).reduce((a, v) => a + v, 0);
}

function solve2(data)
{
  if (useHyperNeutrino)
  {
    return hyperNeutrino2(data);
  }
  const scores = data
    .map(v => v.replace(/^.*: /, '').split(/\s*\|\s*/))
    .map(([ w, m ]) => intersect(w.split(/\s+/), m.split(/\s+/)).length);

  let total = 0;
  for (let i = data.length - 1; i >= 0; i--)
  {
    total += getPrize(i, scores);
  }

  return total;
}

export default async function day04(target)
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
  const expect1 = 13;
  if (target.includes('example') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 30;
  if (target.includes('example') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day04', part1, part2, duration: Date.now() - start };
}
