#!/usr/bin/env node

import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day23');

if (process.argv[2])
{
  day23(process.argv[2])
    .then(console.log)
    .catch(err => console.log(err.message));
}

function neighbors(grid, r, c, d)
{
  const back = { U: 'D', D: 'U', R: 'L', L: 'R' };

  const points = [
    [ r - 1, c, 'U' ],
    [ r + 1, c, 'D' ],
    [ r, c - 1, 'L' ],
    [ r, c + 1, 'R' ]
  ];

  return points.filter(([ pr, pc, pd ]) =>
    pr > 0 && pr < grid.h &&
    pc > 0 && pc < grid.w &&
    grid[pr][pc] !== '#' &&
    pd !== back[d] &&
    ! /^(Uv|D^|R<|L>$)/.test(`${pd}${grid[pr][pc]}`));
}

const kv = (r, c, d) => `${r},${c}:${d}`;

function walk(grid, sr, sc, er, ec, dir = 'X')
{
  const stack = [];

  stack.push({ cost: 0, r: sr, c: sc, d: dir });
  const seen = new Set();

  const answers = [];
  while (stack.length > 0)
  {
    debug('stack:', stack.length);
    const { cost, r, c, d } = stack.shift();
    debug({ cost, r, c, d });
    if (seen.has(kv(r, c))) { continue; }

    seen.add(kv(r, c, d));

    if (r === er && c === ec)
    {
      answers.push({ seen, cost });
      continue;
    }

    const next = neighbors(grid, r, c, d);
    debug('next:', next);
    next.forEach(([ nr, nc, nd ]) =>
      stack.push({ cost: cost + 1, r: nr, c: nc, d: nd }));
  }

  const max = Math.max(...answers.map(v => v.cost));

  return answers.find(v => v.cost === max);
}

function drawPath(grid, seen)
{
  Array.from(seen).forEach(k =>
  {
    const [ pr, pc ] = k.split(':').at(0).split(',').map(Number);
    const l = grid[pr].split('');
    l[pc] = 'O';
    if (/^[<>v^]$/.test(grid[pr][pc])) { return; }
    grid[pr] = l.join('');
  });
  console.log(grid.join('\n'));
}

function solve1(data)
{
  data.w = data[0].length;
  data.h = data.length;

  const sc = data[0].indexOf('.');
  const sr = 0;
  const ec = data.at(-1).indexOf('.');
  const er = data.length - 1;

  debug('start:', sr, sc);
  debug('end:', er, ec);

  const res = walk(data, sr, sc, er, ec);
  if (debug.enabled)
  {
    drawPath(data, res.seen);
  }

  return res.cost;
}

function solve2(data)
{
  debug('data:', data);
  return 0;
}

export default async function day23(target)
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
  const expect1a = 94;
  if (target.includes('example') && part1 !== expect1a)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1a}`);
  }
  const expect1b = 2254;
  if (target === 'data.txt' && part1 !== expect1b)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1b}`);
  }

  const part2 = solve2(data);
  const expect2a = 0;
  if (target.includes('example') && part2 !== expect2a)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2a}`);
  }
  const expect2b = 0;
  if (target === 'data.txt' && part2 !== expect2b)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2b}`);
  }

  return { day: 'day23', part1, part2, duration: Date.now() - start };
}
