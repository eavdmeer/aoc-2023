import * as fs from 'fs/promises';
import makeDebug from 'debug';
import { MinPriorityQueue } from '@datastructures-js/priority-queue';

const debug = makeDebug('day17');

if (process.argv[2])
{
  day17(process.argv[2]).then(console.log);
}

function neighbors(data, r, c, d, steps)
{
  const allowRepeat = steps < 3;
  const back = { U: 'D', D: 'U', R: 'L', L: 'R' };
  const points = [
    [ r, c + 1, 'R' ],
    [ r + 1, c, 'D' ],
    [ r, c - 1, 'L' ],
    [ r - 1, c, 'U' ]
  ];
  return points
    .filter(([ rp, cp, dp ]) =>
      rp >= 0 &&
      rp < data.length &&
      cp >= 0 &&
      cp < data[0].length &&
      dp !== back[d] &&
      (allowRepeat || dp !== d)
    );
}

function solve(data, rs, cs, re, ce)
{
  const heap = new MinPriorityQueue(v => v.cost);

  heap.push({ cost: 0, r: rs, c: cs, d: '-', steps: 0, path: [] });
  const seen = new Map();

  while (heap.size() > 0)
  {
    const { cost, r, c, d, steps, path } = heap.dequeue();

    const key = `${r},${c},${d},${steps}`;

    if (seen.has(key)) { continue; }

    path.push({ r, c, d, cost });
    seen.set(key, { r, c, d, steps, cost });

    if (r === re && c === ce) { return { path, cost }; }

    // Add all neighbors we are allowed to move to on the heap
    neighbors(data, r, c, d, steps).forEach(([ lr, lc, ld ]) =>
    {
      heap.push({
        cost: cost + data[lr][lc],
        r: lr, c: lc,
        d: ld, steps: ld === d ? steps + 1 : 1,
        path: [ ...path ] });
    });
  }

  throw new Error('No more open paths! Unable to reach end point!');
}

function solve1(data)
{
  const grid = data
    .map(line => line
      .split('')
      .map(v => parseInt(v, 10)
      )
    );

  // return solve(grid, 0, 0, data.length - 1, data[0].length - 1);
  const solution = solve(grid, 0, 0, data.length - 1, data[0].length - 1);
  console.log('final path:', solution.path.map(v => v.d).join(''),
    'with cost:', solution.cost);

  return solution.cost;
}

function solve2()
{
  return 'todo';
}

export default async function day17(target)
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
  const expect1 = 102;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }
  if (target.includes('data.txt') && part1 !== 698)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; 698`);
  }

  const part2 = solve2(data);
  const expect2 = 'todo';
  if (target.includes('example2') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day17', part1, part2, duration: Date.now() - start };
}
