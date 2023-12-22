#!/usr/bin/env node

import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day22');

if (process.argv[2])
{
  day22(process.argv[2]).then(console.log);
}

const kv = (x, y) => `${x},${y}`;

function settle(bricks)
{
  bricks.sort((a, b) => a[1][2] - b[1][2]);

  const zbase = new Map();

  bricks.forEach((brick, i) =>
  {
    const b1 = brick[0];
    const b2 = brick[1];
    const zmin = Math.min(b1[2], b2[2]);

    debug('settle brick', i, b1, b2, 'min-z:', zmin);

    // Get lowest z available over all x-y in our brick
    const vals = [ { brick: -1, z: 0 } ];
    for (let x = b1[0]; x <= b2[0]; x++)
    {
      for (let y = b1[1]; y <= b2[1]; y++)
      {
        const key = kv(x, y);
        if (zbase.has(key))
        {
          vals.push(zbase.get(key));
        }
      }
    }
    const floor = Math.max(...vals.map(v => v.z));
    debug('floor is at', floor);

    // Update support info
    const supports = vals.filter(v => v.z === floor).map(v => v.brick);
    brick.push(supports.filter((v, i, a) => a.indexOf(v) === i));

    // Drop the brick to the floor
    b1[2] += 1 + floor - zmin;
    b2[2] += 1 + floor - zmin;

    // Update zbase
    for (let x = b1[0]; x <= b2[0]; x++)
    {
      for (let y = b1[1]; y <= b2[1]; y++)
      {
        for (let z = b1[2]; z <= b2[2]; z++)
        {
          const key = kv(x, y);
          zbase.set(key, { brick: i, z });
        }
      }
    }
  });
}

function solve1(data)
{
  const bricks = data
    .map(line => line
      .split('~')
      .map(v => v
        .split(',')
        .map(Number)));

  debug('bricks:', bricks);

  settle(bricks);

  debug('settled bricks:', bricks);

  return bricks.filter((brick, i) =>
  {
    const x = bricks
      .slice(i + 1)
      .filter(v => v[2].includes(i) && v[2].length < 2);
    return x.length === 0;
  }).length;
}

function solve2(data)
{
  const bricks = data
    .map(line => line
      .split('~')
      .map(v => v
        .split(',')
        .map(Number)));

  settle(bricks);
  debug('settled bricks:', bricks);

  return bricks.map((brick, i) =>
  {
    // Chain of blocks that would fall
    const chain = [ i ];

    bricks
      // Add original brick number to each brick
      .map((b, i) => [ i, ...b ])
      // Only the bricks on top of this one could fall
      .filter(b => b[1][2] > brick[0][2])
      .forEach(b =>
      {
        // Remove the supports in the chain for each brick
        const supports = b[3].filter(v => ! chain.includes(v));
        // If it has no more supports. This brick will fall
        if (supports.length === 0) { chain.push(b[0]); }
      });

    debug('chain:', chain);

    return chain.length - 1;
  }).reduce((a, v) => a + v, 0);
}

export default async function day22(target)
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
  const expect1a = 5;
  if (target.includes('example') && part1 !== expect1a)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1a}`);
  }
  const expect1b = 443;
  if (target === 'data.txt' && part1 !== expect1b)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1b}`);
  }

  const part2 = solve2(data);
  const expect2a = 7;
  if (target.includes('example') && part2 !== expect2a)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2a}`);
  }
  const expect2b = 69915;
  if (target === 'data.txt' && part2 !== expect2b)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2b}`);
  }

  return { day: 'day22', part1, part2, duration: Date.now() - start };
}
