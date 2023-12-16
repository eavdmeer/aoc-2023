import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day16');

if (process.argv[2])
{
  day16(process.argv[2]).then(console.log);
}

function walk(grid, pos, dir, visited, beam = 0)
{
  debug('beam:', beam, 'pos:', pos, 'dir:', dir);
  debug(visited.size);

  const key = `${pos.r}-${pos.c}:${dir.r}-${dir.c}}`;

  if (visited.has(key))
  {
    debug('circular path detected, terminating beam', beam);
    return;
  }

  if (pos.c >= 0)
  {
    visited.add(key);
  }

  const npos = { r: pos.r + dir.r, c: pos.c + dir.c };

  // detect going off grid
  if (npos.r < 0 || npos.r >= grid.length ||
    npos.c < 0 || npos.c >= grid[0].length)
  {
    debug('going off grid, terminating beam', beam);
    return;
  }

  const ch = grid[npos.r].charAt(npos.c);

  if (ch === '.')
  {
    debug('empty spot, walking on');
    walk(grid, npos, dir, visited, beam);
  }
  else if (ch === '-')
  {
    if (dir.r === 0)
    {
      debug('walk through horizontally');
      walk(grid, npos, dir, visited, beam);
    }
    else
    {
      debug('split beam horizontally');
      walk(grid, npos, { r: 0, c: -1 }, visited, beam);
      walk(grid, npos, { r: 0, c: 1 }, visited, beam + 1);
    }
  }
  else if (ch === '|')
  {
    if (dir.c === 0)
    {
      debug('walk through vertically');
      walk(grid, npos, dir, visited);
    }
    else
    {
      debug('split beam vertically');
      walk(grid, npos, { r: -1, c: 0 }, visited, beam);
      walk(grid, npos, { r: 1, c: 0 }, visited, beam + 1);
    }

  }
  else if (ch === '/')
  {
    if (dir.r !== 0)
    {
      if (dir.r > 0)
      {
        debug('reflect down to left');
        walk(grid, npos, { r: 0, c: -1 }, visited, beam);
      }
      else
      {
        debug('reflect up to right');
        walk(grid, npos, { r: 0, c: 1 }, visited, beam);
      }
    }
    else
    {
      if (dir.c > 0)
      {
        debug('reflect right to up');
        walk(grid, npos, { r: -1, c: 0 }, visited, beam);
      }
      else
      {
        debug('reflect left to down');
        walk(grid, npos, { r: 1, c: 0 }, visited, beam);
      }
    }
  }
  else if (ch === '\\')
  {
    if (dir.r !== 0)
    {
      if (dir.r > 0)
      {
        debug('reflect down to right');
        walk(grid, npos, { r: 0, c: 1 }, visited, beam);
      }
      else
      {
        debug('reflect up to left');
        walk(grid, npos, { r: 0, c: -1 }, visited, beam);
      }
    }
    else
    {
      if (dir.c > 0)
      {
        debug('reflect right to down');
        walk(grid, npos, { r: 1, c: 0 }, visited, beam);
      }
      else
      {
        debug('reflect left to up');
        walk(grid, npos, { r: -1, c: 0 }, visited, beam);
      }
    }
  }
  else
  {
    throw new Error(`unknown character found on grid: '${ch}' at r = ${npos.r}, c = ${npos.c}`);
  }
}

function solve1(data)
{
  const visited = new Set();
  walk(data, { r: 0, c: -1 }, { r: 0, c: 1 }, visited);

  const unique = new Set();
  for (const v of visited)
  {
    unique.add(v.split(':')[0]);
  }

  debug(unique);

  return unique.size;
}

function solve2()
{
  return 'todo';
}

export default async function day16(target)
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
  const expect1 = 46;
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

  return { day: 'day16', part1, part2, duration: Date.now() - start };
}
