#!/usr/bin/env node

import * as fs from 'fs/promises';
import makeDebug from 'debug';

/* eslint-disable no-labels */

const useHyperNeutrino = true;

const debug = makeDebug('day21');

const posmod = (v, n) => (v % n + n) % n;

if (process.argv[2])
{
  day21(process.argv[2])
    .then(console.log)
    .catch(err => console.log(err.message));
}

function neighbors(grid, r, c, modulo = false)
{
  return [
    [ r + 1, c ],
    [ r - 1, c ],
    [ r, c + 1 ],
    [ r, c - 1 ]
  ].filter(([ lr, lc ]) =>
    (modulo || lr >= 0 && lr < grid.rows && lc >= 0 && lc < grid.cols) &&
    grid[posmod(lr, grid.rows)].charAt(posmod(lc, grid.cols)) !== '#');
}

function count(grid, r, c, steps, part = 1, seen = new Set(), cache = new Map())
{
  debug('count:', 'row:', r, 'col:', c, 'steps:', steps);

  const key = `${r},${c}-${steps}`;
  if (cache.has(key)) { return 0; }

  const next = neighbors(grid, r, c, part === 2);

  if (steps > 1)
  {
    next.forEach(([ nr, nc ]) =>
      count(grid, nr, nc, steps - 1, part, seen, cache));
  }
  else
  {
    next.forEach(([ nr, nc ]) => seen.add(`${nr},${nc}`));
  }

  cache.set(key, seen.size);

  return seen.size;
}

const kv = (r, c) => `${r},${c}`;

function hyperNeutrino1(grid, ...args)
{
  const seen = new Set();
  const ans = new Set();

  const stack = [ args ];
  while (stack.length)
  {
    const [ r, c, steps ] = stack.shift();

    if (steps % 2 === 0) { ans.add(kv(r, c)); }

    if (steps === 0 || seen.has(kv(r, c))) { continue; }

    seen.add(kv(r, c));

    neighbors(grid, r, c)
      .forEach(([ nr, nc ]) => stack.push([ nr, nc, steps - 1 ]));
  }

  return ans.size;
}

function solve1(data, steps)
{
  data.cols = data[0].length;
  data.rows = data.length;

  let r;
  let c;
  main:
  for (r = 0; r < data.rows; r++)
  {
    for (c = 0; c < data.cols; c++)
    {
      if (data[r].charAt(c) === 'S') { break main; }
    }
  }
  debug('start:', r, c, steps);

  if (useHyperNeutrino)
  {
    return hyperNeutrino1(data, r, c, steps);
  }

  return count(data, r, c, steps, 1);
}

export default async function day21(target)
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

  const part1 = solve1(data, target.includes('example') ? 6 : 64);
  const expect1a = 16;
  if (target.includes('example') && part1 !== expect1a)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1a}`);
  }
  const expect1b = 3858;
  if (target === 'data.txt' && part1 !== expect1b)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1b}`);
  }

  /*
  const part2 = solve2(data, target.includes('example') ? 100 : 26501365);
  const expect2a = 6536;
  if (target.includes('example') && part2 !== expect2a)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2a}`);
  }
  const expect2b = 0;
  if (target === 'data.txt' && part2 !== expect2b)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2b}`);
  }
  */
  const part2 = 0;

  return { day: 'day21', part1, part2, duration: Date.now() - start };
}
