import * as fs from 'fs/promises';
import makeDebug from 'debug';
import assert from 'assert';

const debug = makeDebug('day13');

if (process.argv[2])
{
  day13(process.argv[2]).then(console.log);
}

const same = (a, b) =>
  a.length === b.length &&
  a.every((element, index) => element === b[index]);

const delta = (s1, s2) => s1.split('').reduce((a, v, i) =>
  a + (v === s2.charAt(i) ? 0 : 1), 0);

function transpose(matrix)
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

function findMirrorRow(grid, smudge = false)
{
  // console.log('find mirror row:', smudge);
  // console.log(grid.join('\n'));
  for (let r = 1; r < grid.length; r++)
  {
    const before = grid.slice(0, r).reverse();
    const after = grid.slice(r);
    const len = Math.min(before.length, after.length);
    before.length = len;
    after.length = len;
    if (smudge)
    {
      const differences = before
        .map((bval, i) => delta(bval, after[i]))
        .reduce((a, v) => a + v, 0);
      if (differences === 1)
      {
        return r;
      }
    }
    else if (same(before, after))
    {
      return r;
    }
  }
  return undefined;
}

function score(grid, smudge)
{
  const row = findMirrorRow(grid, smudge);
  const col = findMirrorRow(transpose(grid), smudge);

  const values = [ 0 ];
  if (col) { values.push(col); }
  if (row) { values.push(100 * row); }

  return Math.max(...values);
}

function solve1(data)
{
  const puzzles = data.split('\n\n').map(p => p.split('\n'))
    .map(puzzle => score(puzzle));

  assert.ok(puzzles.every(v => v !== 0), 'Not expecting any zeros!');

  return puzzles.reduce((a, v) => a + v, 0);
}

function solve2(data)
{
  const puzzles = data.split('\n\n').map(p => p.split('\n'))
    .map(puzzle => score(puzzle, true));

  // assert.ok(puzzles.every(v => v !== 0), 'Not expecting any zeros!');

  return puzzles.reduce((a, v) => a + v, 0);
}

export default async function day13(target)
{
  const start = Date.now();
  debug('starting');

  const buffer = await fs.readFile(target);

  /* eslint-disable no-shadow */
  const data = buffer
    .toString()
    .trim();
  /* eslint-enable no-shadow */

  debug('data', data);

  const part1 = solve1(data);
  const expect1 = 405;
  if (target.includes('example.txt') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 400;
  if (target.includes('example.txt') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day13', part1, part2, duration: Date.now() - start };
}
