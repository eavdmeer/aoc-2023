import * as fs from 'fs/promises';
import makeDebug from 'debug';

/* eslint-disable no-else-return */

const debug = makeDebug('day16');

if (process.argv[2])
{
  day16(process.argv[2]).then(console.log);
}

const offGrid = (grid, r, c) => r < 0 || r >= grid.length ||
  c < 0 || c >= grid[0].length;

function walk(grid, r, c, dir, visited = new Set(), m = new Set(), beam = 0)
{
  debug('beam:', beam, 'pos:', r, c, 'dir:', dir);
  debug(visited.size);

  const key = `${r}-${c}:${dir.r}-${dir.c}}`;

  if (visited.has(key))
  {
    debug('circular path detected, terminating beam', beam);
    return m.size;
  }

  if (! offGrid(grid, r, c))
  {
    visited.add(key);
    m.add(`${r},${c}`);
  }

  const nr = r + dir.r;
  const nc = c + dir.c;

  // detect going off grid
  if (offGrid(grid, nr, nc))
  {
    debug('going off grid, terminating beam', beam);
    return m.size;
  }

  const ch = grid[nr].charAt(nc);

  if (ch === '.')
  {
    return walk(grid, nr, nc, dir, visited, m, beam);
  }

  if (ch === '-')
  {
    if (dir.r === 0)
    {
      return walk(grid, nr, nc, dir, visited, m, beam);
    }

    return Math.max(
      walk(grid, nr, nc, { r: 0, c: -1 }, visited, m, beam),
      walk(grid, nr, nc, { r: 0, c: 1 }, visited, m, beam + 1)
    );
  }

  if (ch === '|')
  {
    if (dir.c === 0)
    {
      return walk(grid, nr, nc, dir, visited, m, beam);
    }

    return Math.max(
      walk(grid, nr, nc, { r: -1, c: 0 }, visited, m, beam),
      walk(grid, nr, nc, { r: 1, c: 0 }, visited, m, beam + 1)
    );
  }

  if (ch === '/')
  {
    if (dir.r !== 0)
    {
      return walk(grid, nr, nc, { r: 0, c: dir.r > 0 ? -1 : 1 },
        visited, m, beam);
    }
    return walk(grid, nr, nc, { r: dir.c > 0 ? -1 : 1, c: 0 },
      visited, m, beam);
  }

  if (ch === '\\')
  {
    if (dir.r !== 0)
    {
      return walk(grid, nr, nc, { r: 0, c: dir.r > 0 ? 1 : -1 },
        visited, m, beam);
    }
    return walk(grid, nr, nc, { r: dir.c > 0 ? 1 : -1, c: 0 },
      visited, m, beam);
  }

  throw new Error(`unknown character found on grid: '${ch}' at r = ${nr}, c = ${nc}`);
}

function solve1(data)
{
  return walk(data, 0, -1, { r: 0, c: 1 });
}

function solve2(data)
{
  const scores = [];
  for (let r = 0; r < data.length; r++)
  {
    scores.push(walk(data, r, -1, { r: 0, c: 1 }));
    scores.push(walk(data, r, data[0].length, { r: 0, c: -1 }));
  }
  for (let c = 0; c < data[0].length; c++)
  {
    scores.push(walk(data, -1, c, { r: 1, c: 0 }));
    scores.push(walk(data, data.length, c, { r: -1, c: 0 }));
  }

  return Math.max(...scores);
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
  if (target.includes('example') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 51;
  if (target.includes('example') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }
  if (target.includes('data.txt') && part2 !== 8244)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; 8244`);
  }

  return { day: 'day16', part1, part2, duration: Date.now() - start };
}
