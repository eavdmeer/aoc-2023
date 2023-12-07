import * as fs from 'fs/promises';
import makeDebug from 'debug';

import assert from 'node:assert';

const debug = makeDebug('day06');

if (process.argv[2])
{
  day06(process.argv[2]).then(console.log);
}

function dt(max)
{
  const d = [];

  for (let h = 0; h < max; h++)
  {
    d.push(h * (max - h));
  }

  return d;
}

function solve1(data)
{
  const [ times, distances ] = data
    .map(v => v
      .replace(/^.*:\s*/, '')
      .split(/\s+/)
      .map(d => parseInt(d, 10))
    );
  const rounds = [];
  times.forEach((t, i) => rounds.push([ t, distances[i] ]));

  return rounds
    .map(([ t, dmax ]) => dt(t)
      .map(d => d > dmax ? 1 : 0)
      .reduce((a, v) => a + v, 0)
    )
    .reduce((a, v) => a * v, 1);
}

function abcFormula(a, b, c)
{
  return {
    min: (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / 2 * a,
    max: (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / 2 * a
  };
}

function solve2(data)
{
  const [ time, distance ] =
    data.map(v => parseInt(v.replace(/[^\d]*/g, ''), 10));

  const d = h => h * (time - h);

  /*
    d = h * (T - h)
    h2 - hT + d = 0

    h = (T +/- sqrt(T^2 - 4 * d))/2
  */

  const solution = abcFormula(1, -time, distance);

  assert.ok(d(Math.ceil(solution.min)) > distance);
  assert.ok(d(Math.floor(solution.max)) > distance);

  return 1 + Math.floor(solution.max) - Math.ceil(solution.min);
}

export default async function day06(target)
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
  const expect1 = 288;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 71503;
  if (target.includes('example2') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day06', part1, part2, duration: Date.now() - start };
}
