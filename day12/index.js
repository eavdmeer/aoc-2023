import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day12');

if (process.argv[2])
{
  day12(process.argv[2]).then(console.log);
}

const cache = new Map();

function count(cfg, nums)
{
  if (cfg === '') { return nums.length ? 0 : 1; }

  if (nums.length === 0) { return cfg.includes('#') ? 0 : 1; }

  const key = `${cfg}:${nums.join('-')}`;

  if (cache.has(key)) { return cache.get(key); }

  let result = 0;

  if (/[.?]/.test(cfg[0]))
  {
    result += count(cfg.substring(1), nums);
  }

  if (/[#?]/.test(cfg[0]))
  {
    if (
      nums[0] <= cfg.length &&
      ! cfg.substring(0, nums[0]).includes('.') && (
        cfg.length === nums[0] || cfg.charAt(nums[0]) !== '#'
      )
    )
    {
      result += count(cfg.substring(1 + nums[0]), nums.slice(1));
    }
  }

  cache.set(key, result);

  return result;
}

function solve1(data)
{
  const grid = data
    .map(line => line.split(' '))
    .map(([ a, b ]) => ({
      txt: a,
      counts: b.split(',').map(v => parseInt(v, 10))
    }));

  return grid.map(row => count(row.txt, row.counts))
    .reduce((a, v) => a + v, 0);
}

function unfold({ txt, counts })
{
  return {
    txt: `${txt}?${txt}?${txt}?${txt}?${txt}`,
    counts: [ ...counts, ...counts, ...counts, ...counts, ...counts ]
  };
}

function solve2(data)
{
  const grid = data
    .map(line => line.split(' '))
    .map(([ a, b ]) => ({
      txt: a,
      counts: b.split(',').map(v => parseInt(v, 10))
    }));

  return grid
    .map(row => unfold(row))
    .map(row => count(row.txt, row.counts))
    .reduce((a, v) => a + v, 0);
}

export default async function day12(target)
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
  const expect1 = 21;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 525152;
  if (target.includes('example2') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day12', part1, part2, duration: Date.now() - start };
}
