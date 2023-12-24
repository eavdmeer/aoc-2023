#!/usr/bin/env node

import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day24');

if (process.argv[2])
{
  day24(process.argv[2])
    .then(console.log)
    .catch(err => console.log(err.message));
}

function solve1(data, range)
{
  const hailStones = data
    .map(v => v.split(' @ '))
    .map(([ a, b ]) => [
      a.split(',').map(Number),
      b.split(',').map(Number)
    ]);

  debug('hail stones:', hailStones);

  let total = 0;

  /*
   * Trajectory equation:
   *
   * y = py + vy * (x - px) / vx
   *
   * Intersection:
   *
   * p1y + v1y * (x - p1x) / v1x = p2y + v2y * (x - p2x) / v2x
   */
  hailStones.forEach(([ [ p1x, p1y ], [ v1x, v1y ] ], i) =>
  {
    hailStones.slice(i + 1).forEach(([ [ p2x, p2y ], [ v2x, v2y ] ], j) =>
    {
      debug('intersect', i, 'and', i + j + 1);

      const x = (v2x * (p1y * v1x - p1x * v1y - v1x * p2y) + v1x * p2x * v2y) / (v1x * v2y - v1y * v2x);
      const y = p1y + v1y * (x - p1x) / v1x;

      debug('intersection at', x, y);

      const t1 = (x - p1x) / v1x;
      const t2 = (x - p2x) / v2x;
      debug('intersection times:', t1, t2);

      if (t1 < 0 || t2 < 0)
      {
        debug('intersection was in the past');
        return;
      }

      if (x >= range[0] && x <= range[1] &&
        y >= range[0] && y <= range[1])
      {
        total++;
      }
      else
      {
        debug('intersection outside of range');
      }
      debug('intersections within range:', range, total);
    });
  });

  return total;
}

function solve2(data)
{
  debug('data:', data);
  return 0;
}

export default async function day24(target)
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

  const part1 = solve1(data, target.includes('example') ?
    [ 7, 27 ] : [ 200000000000000, 400000000000000 ]);
  const expect1a = 2;
  if (target.includes('example') && part1 !== expect1a)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1a}`);
  }
  const expect1b = 16779;
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

  return { day: 'day24', part1, part2, duration: Date.now() - start };
}
