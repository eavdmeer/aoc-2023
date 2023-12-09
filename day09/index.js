import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day09');

if (process.argv[2])
{
  day09(process.argv[2]).then(console.log);
}

function evolve(rows)
{
  const row = rows[rows.length - 1];

  if (row.every(v => v === 0)) { return rows; }

  rows.push(row.map((v, i, m) => i === 0 ? 0 : v - m[i - 1]).slice(1));

  return evolve(rows);
}

function predict(grid)
{
  return grid.reduce((a, v) => a + v[v.length - 1], 0);
}

function solve1(data)
{
  const grid = data
    .map(v => v.split(' ').map(w => parseInt(w, 10)));

  const matrix = grid.map(v => evolve([ v ]));

  const predictions = matrix.map(v => predict(v));

  return predictions.reduce((a, v) => a + v, 0);
}

function predict2(grid)
{
  return [ ...grid ].reverse().reduce((a, v) => v[0] - a, 0);
}

function solve2(data)
{
  const grid = data
    .map(v => v.split(' ').map(w => parseInt(w, 10)));

  const matrix = grid.map(v => evolve([ v ]));

  const predictions = matrix.map(v => predict2(v));

  return predictions.reduce((a, v) => a + v, 0);
}

export default async function day09(target)
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
  const expect1 = 114;
  if (target.includes('example') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 2;
  if (target.includes('example') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day09', part1, part2, duration: Date.now() - start };
}
