import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day18');

if (process.argv[2])
{
  day18(process.argv[2]).then(console.log);
}

function dig(ops)
{
  let r = 0;
  let c = 0;

  const points = [];
  let len = 0;

  ops.forEach(op =>
  {
    switch (op.dir)
    {
      case 'U': r -= op.steps; break;
      case 'D': r += op.steps; break;
      case 'L': c -= op.steps; break;
      case 'R': c += op.steps; break;
      default: break;
    }
    len += op.steps;
    points.push([ r, c ]);
  });

  debug('points:', points);
  debug('length:', len);

  const modn = i => i % points.length;

  const area = Math.abs(points
    .map((p, i) =>
      p[0] * (points.at(i - 1).at(1) - points.at(modn(i + 1)).at(1)))
    .reduce((a, v) => a + v, 0)) / 2;

  debug('area:', area);

  return area + 1 + len / 2;
}

function solve1(data)
{
  const ops = data
    .map(v => v.split(' '))
    .map(v => ({ dir: v[0], steps: parseInt(v[1], 10) }));
  debug(ops);

  return dig(ops);
}

function solve2(data)
{
  const dirs = [ 'R', 'D', 'L', 'U' ];
  const ops = data
    .map(v => v.split(' '))
    .map(v => ({
      dir: dirs.at(v[2].substr(-2, 1)),
      steps: parseInt(v[2].substr(2, 5), 16)
    }));
  debug(ops);

  return dig(ops);
}

export default async function day18(target)
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
  const expect1 = 62;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 952408144115;
  if (target.includes('example2') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day18', part1, part2, duration: Date.now() - start };
}
