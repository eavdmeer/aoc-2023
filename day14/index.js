import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day14');

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

function solve1(data)
{
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

  return grid
    .map(row => row
      .map((v, i) => v === 'O' ? row.length - i : 0)
      .reduce((a, v) => a + v, 0))
    .reduce((a, v) => a + v, 0);
}

function solve2()
{
  return 'todo';
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

  return { day: 'day14', part1, part2, duration: Date.now() - start };
}
