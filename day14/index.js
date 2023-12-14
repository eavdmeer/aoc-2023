import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day14');

const useHyperNeutrino = true;

if (process.argv[2])
{
  day14(process.argv[2]).then(console.log);
}

function transpose(matrix)
{
  const result = [];

  for (let i = 0; i < matrix[0].length; i++) { result.push([]); }

  matrix.forEach(row =>
  {
    row.forEach((col, c) => result[c].push(col));
  });

  return result;
}

function score(grid)
{
  return grid
    .map(row => row
      .map((v, i) => v === 'O' ? row.length - i : 0)
      .reduce((a, v) => a + v, 0))
    .reduce((a, v) => a + v, 0);
}

function strTranspose(matrix)
{
  const result = [];

  for (let i = 0; i < matrix[0].length; i++)
  {
    result.push([]);
  }

  matrix.forEach(row =>
  {
    row.split('').forEach((col, c) => result[c].push(col));
  });

  return result.map(v => v.join(''));
}

function hyperStep(data)
{
  const grid = strTranspose(data);

  const res = grid.map(str => str.split('#')
    .map(v => v.split('')
      .sort()
      .reverse()
      .join(''))
    .join('#'));

  return res;
}

function hyperNeutrino1(data)
{
  const res = hyperStep(data);

  return res
    .map(row => row
      .split('')
      .map((v, i) => v === 'O' ? row.length - i : 0)
      .reduce((a, v) => a + v, 0))
    .reduce((a, v) => a + v, 0);
}
function solve1(data)
{
  if (useHyperNeutrino)
  {
    return hyperNeutrino1(data);
  }

  const grid = transpose(data.map(line => line.split('')));

  // console.log('grid:');
  // console.log(grid.map(v => v.join('')).join('\n'));

  grid.forEach(row =>
  {
    let i = 0;
    debug('row:', row.join(''));
    while (i < row.length)
    {
      debug(i, row[i]);
      if (row[i] === '.')
      {
        debug('process');
        const oidx = row.indexOf('O', i + 1);
        if (oidx < 0)
        {
          debug('no more O entries. ending loop');
          break;
        }
        const hidx = row.indexOf('#', i + 1);
        if (hidx >= 0 && hidx < oidx)
        {
          debug('no candidate, skip hash at', hidx);
          i = hidx;
        }
        else
        {
          debug('swap', oidx, 'to', i);
          row[i] = 'O';
          row[oidx] = '.';
        }
      }
      else
      {
        debug('skip');
      }
      i++;
    }
    debug('row after:', row.join(''));
  });

  // console.log('after:');
  // console.log(grid.map(v => v.join('')).join('\n'));

  return score(grid);
}

function look(grid, ball, delta)
{
  const w = grid[0].length;
  const h = grid.length;

  let r = ball.r;
  let c = ball.c;
  let hit;

  do
  {
    r += delta.r;
    c += delta.c;
    if (grid?.[r]?.[c] === '.')
    {
      hit = { r, c };
    }
    else
    {
      return hit;
    }
  } while (r >= 0 && c >= 0 && r < h && c < w);

  return undefined;
}

function tilt(grid, direction)
{
  const balls = [];
  grid.forEach((row, r) =>
  {
    row.forEach((ch, c) =>
    {
      if (ch === 'O') { balls.push({ r, c }); }
    });
  });
  const delta = { r: 0, c: 0 };
  switch (direction)
  {
    case 'N':
      balls.sort((a, b) => a.r - b.r);
      delta.r = -1; delta.c = 0;
      break;
    case 'E':
      balls.sort((a, b) => b.c - a.c);
      delta.r = 0; delta.c = 1;
      break;
    case 'W':
      balls.sort((a, b) => a.c - b.c);
      delta.r = 0; delta.c = -1;
      break;
    case 'S':
      balls.sort((a, b) => b.r - a.r);
      delta.r = 1; delta.c = 0;
      break;
    default:
      break;
  }

  balls.forEach(ball =>
  {
    const free = look(grid, ball, delta);
    if (free)
    {
      grid[free.r][free.c] = 'O';
      grid[ball.r][ball.c] = '.';
      ball.r = free.r;
      ball.c = free.c;
    }
  });
}

function sum(grid)
{
  return grid.map(v => v.join('')).join('');
}

function cycle(grid)
{
  tilt(grid, 'N');
  tilt(grid, 'W');
  tilt(grid, 'S');
  tilt(grid, 'E');
}

function solve2(data)
{
  const grid = data.map(line => line.split(''));

  const checksums = new Map();

  let it = 0;
  let checksum;

  do
  {
    checksum = sum(grid);
    checksums.set(checksum, it);
    cycle(grid);
    it++;
    checksum = sum(grid);
  } while (it < 3000 && ! checksums.has(sum(grid)));

  const offset = checksums.get(checksum);
  const len = it - offset;
  debug('cycle every', len, 'cycles after', offset);

  const cycles = (1000000000 - offset) % len;

  debug('need', cycles, 'more cycles');

  for (let i = 0; i < cycles; i++) { cycle(grid); }

  return score(transpose(grid));
}

export default async function day14(target)
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
  const expect1 = 136;
  if (target.includes('example') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }
  else if (target === 'data.txt' && part1 !== 108641)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; 108641`);
  }

  const part2 = solve2(data);
  const expect2 = 64;
  if (target.includes('example') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day14', part1, part2, duration: Date.now() - start };
}
