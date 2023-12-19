import * as fs from 'fs/promises';
import makeDebug from 'debug';

/* eslint-disable no-eval */

const debug = makeDebug('day19');

if (process.argv[2])
{
  day19(process.argv[2]).then(console.log);
}

function runRules(rules, parts)
{
  const results = new Map([ [ 'A', [] ], [ 'B', [] ] ]);

  parts.forEach(({ x, m, a, s }) =>
  {
    const evaluate = ([ cond, dest ]) =>
    {
      if (eval(cond))
      {
        if (results.has(dest))
        {
          results.get(dest).push(x + m + a + s);
        }
        return true;
      }
      return false;
    };

    let current = 'in';
    while (current !== 'A' && current !== 'R')
    {
      current = rules.get(current).find(evaluate).at(1);
    }
  });

  return results;
}

function solve1(data)
{
  const sections = data.split('\n\n');
  const rules = new Map();

  sections.at(0)
    .split('\n')
    .map(v => v.match(/^(.*){(.*)}$/))
    .forEach(v => rules.set(v[1],
      v[2]
        .split(',')
        .map(w => w.includes(':') ? w.split(':') : [ '1==1', w ]))
    );

  const parts = [];
  sections.at(1)
    .split('\n')
    .map(v => v.replace(/=/g, ':'))
    .forEach(v => eval(`parts.push(${v})`));

  debug('rules:', rules);

  debug('parts:', parts);

  const results = runRules(rules, parts);

  debug('results:', results);

  return results.get('A').reduce((a, v) => a + v, 0);
}

function count(workflows, ranges, flow)
{
  if (flow === 'R') { return 0; }
  if (flow === 'A')
  {
    return Object.values(ranges)
      .reduce((a, [ lo, hi ]) => a * (hi - lo + 1), 1);
  }
  const rules = workflows.get(flow);

  let total = 0;

  const workRanges = {
    x: [ ...ranges.x ],
    m: [ ...ranges.m ],
    a: [ ...ranges.a ],
    s: [ ...ranges.s ]
  };

  rules.forEach(([ condition, dest ]) =>
  {
    if (condition === '1==1')
    {
      total += count(workflows, workRanges, dest);
      return;
    }

    const name = condition[0];
    const op = condition[1];
    const val = parseInt(condition.substring(2), 10);

    const [ lo, hi ] = workRanges[name];

    const T = op === '<' ?
      [ lo, Math.min(val - 1, hi) ] :
      [ Math.max(val + 1, lo), hi ];
    const F = op === '<' ?
      [ Math.max(val, lo), hi ] :
      [ lo, Math.min(val, hi) ];

    if (T[0] < T[1])
    {
      total += count(workflows, { ...workRanges, [name]: T }, dest);
    }
    if (F[0] < F[1])
    {
      workRanges[name] = F;
    }
  });

  return total;
}

function solve2(data)
{
  const sections = data.split('\n\n');
  const workflows = new Map();

  sections.at(0)
    .split('\n')
    .map(v => v.match(/^(.*){(.*)}$/))
    .forEach(v => workflows.set(v[1],
      v[2]
        .split(',')
        .map(w => w.includes(':') ? w.split(':') : [ '1==1', w ]))
    );
  debug('workflows:', workflows);

  const ranges = {
    x: [ 1, 4000 ],
    m: [ 1, 4000 ],
    a: [ 1, 4000 ],
    s: [ 1, 4000 ]
  };
  return count(workflows, ranges, 'in');
}

export default async function day19(target)
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
  const expect1 = 19114;
  if (target.includes('example') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }
  if (target.includes('data.txt') && part1 !== 472630)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; 472630`);
  }

  const part2 = solve2(data);
  const expect2 = 167409079868000;
  if (target.includes('example') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }
  if (target.includes('data.txt') && part2 !== 116738260946855)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; 116738260946855expect2`);
  }

  return { day: 'day19', part1, part2, duration: Date.now() - start };
}
