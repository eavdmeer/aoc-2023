import * as fs from 'fs/promises';
import makeDebug from 'debug';

import lcm from 'compute-lcm';

const debug = makeDebug('day08');

if (process.argv[2])
{
  day08(process.argv[2]).then(console.log);
}

function solve1(data)
{
  const steps = data[0].split('');
  debug('steps:', steps);
  const network = data.slice(1)
    .map(v => v.replace(/[=(),]/g, '').split(/ +/))
    .reduce((a, v) => { a[v.shift()] = { L: v[0], R: v[1] }; return a; }, {});
  debug('network:', network);

  let i = 0;
  let position = 'AAA';
  while (position !== 'ZZZ')
  {
    debug('pos:', position, 'step:', steps[i % steps.length]);
    position = network[position][steps[i % steps.length]];
    i++;
  }
  return i;
}

function solve2(data)
{
  const steps = data.shift().split('');
  debug('steps:', steps);
  const network = data
    .map(v => v.replace(/[=(),]/g, '').split(/ +/))
    .reduce((a, v) => { a[v.shift()] = { L: v[0], R: v[1] }; return a; }, {});
  debug('network:', network);

  const startNodes = Object.keys(network).filter(v => v.endsWith('A'));
  debug('start nodes:', startNodes);
  const endNodes = Object.keys(network).filter(v => v.endsWith('Z'));
  debug('end nodes:', endNodes);

  const routes = startNodes.map(node =>
  {
    debug('check node:', node);
    const cache = new Set();
    const visited = new Map();
    let i = 0;
    let pos = node;
    while (visited.size < endNodes.length)
    {
      const step = steps[i % steps.length];

      pos = network[pos][step];
      i++;
      if (endNodes.includes(pos))
      {
        const key = `${pos}-${step}-${i % steps.length}`;
        if (cache.has(key))
        {
          debug('I have seen this place before:', key, i, 'exiting');
          break;
        }
        cache.add(key);
        visited.set(pos, i);
      }
    }
    debug('found routes:', visited);

    return visited;
  });

  debug('foutes:', routes);
  const numbers = routes.map(v => [ ...v.values() ]).flat();

  return lcm(...numbers);
}

export default async function day08(target)
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
  const expect1 = 6;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 6;
  if (target.includes('example2') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day08', part1, part2, duration: Date.now() - start };
}
