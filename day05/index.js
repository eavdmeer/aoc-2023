import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day05');

if (process.argv[2])
{
  day05(process.argv[2]).then(console.log);
}

function parseInput(data)
{
  const res = data
    .split(/^$\n/m)
    .map(v => v.trim());

  const seeds = res.shift()
    .split(' ')
    .map(v => parseInt(v, 10))
    .filter(v => v);

  const maps = {};
  res.forEach(line =>
  {
    const parts = line.split('\n');
    const key = parts.shift().replace(' map:', '');
    const map = [];
    parts.forEach(txt =>
    {
      const [ dst, src, cnt ] = txt.split(' ').map(v => parseInt(v, 10));
      map.push({ src, dst, cnt });
    });
    maps[key] = map;
  });

  return { seeds, maps };
}

function traverseMaps(seed, maps)
{
  let mapped = seed;

  debug('traversing map for seed', seed);
  Object.entries(maps).forEach(([ key, map ]) =>
  {
    debug('-', key);
    const hit = map.some(range =>
    {
      if (mapped >= range.src && mapped < range.src + range.cnt)
      {
        mapped += range.dst - range.src;
        debug('  hit! in range', range);
        debug('  mapped to:', mapped);
        return true;
      }
      return false;
    });
    if (! hit) { debug('  not mapped:', mapped); }
  });
  debug('>', 'result:', mapped);

  return mapped;
}

function solve1(data)
{
  debug('==== part 2 =====');

  const { seeds, maps } = parseInput(data);

  debug(seeds);
  debug(maps);

  const distances = seeds.map(seed => traverseMaps(seed, maps));

  debug('distances:', distances);

  return Math.min(...distances);
}

function traverseMaps2(range, maps)
{
  debug('traversing map for range', range);

  const intervals = [
    { min: range.start, max: range.start + range.length - 1 }
  ];

  Object.entries(maps).slice(0, 10).forEach(([ key, map ]) =>
  {
    debug('-', key);
    debug(map);
    debug('intervals:', intervals);
    intervals.forEach(iv =>
    {
      debug('  ', 'iv:', iv);
      map.some(m =>
      {
        debug('    ', 'm:', m);
        if (iv.min >= m.src && iv.max < m.src + m.cnt)
        {
          if (iv.max < m.src + m.cnt)
          {
            iv.min += m.dst - m.src;
            iv.max += m.dst - m.src;
            debug('      ', 'start and end within interval, interval updated to:', iv);
            return true;
          }

          const newIv = { min: iv.min + m.cnt, max: iv.max };
          iv.min += m.dst - m.src;
          iv.max += m.dst + m.cnt - 1;
          intervals.push(newIv);
          debug('      ', 'start within, but end not within interval');
          debug('      ', 'broken up into:', iv, newIv);
          return true;
        }

        if (iv.max >= m.src && iv.max < m.src + m.cnt)
        {
          const newIv = { min: m.dst, max: iv.max + m.dst - m.src };
          iv.max = m.src - 1;
          intervals.push(newIv);
          debug('      ', 'start not within, but end within interval');
          debug('      ', 'broken up into:', iv, newIv);
          return true;
        }

        debug('      ', 'start and end not within interval, unchanged');

        return false;
      });
    });
  });

  return Math.min(...intervals.map(iv => iv.min));
}

function solve2(data)
{
  debug('==== part 2 =====');

  const { seeds, maps } = parseInput(data);

  const ranges = [];
  for (let i = 0; i < seeds.length; i += 2)
  {
    ranges.push({ start: seeds[i], length: seeds[i + 1] });
  }
  debug('seed ranges:', ranges);

  const distances = ranges.map(range => traverseMaps2(range, maps));

  debug('distances:', distances);

  return Math.min(...distances);
}

export default async function day05(target)
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
  const expect1 = 35;
  if (target.includes('example') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 46;
  if (target.includes('example') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day05', part1, part2, duration: Date.now() - start };
}
