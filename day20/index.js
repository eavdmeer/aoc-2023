import * as fs from 'fs/promises';
import makeDebug from 'debug';
import lcm from 'compute-lcm';

const debug = makeDebug('day20');

if (process.argv[2])
{
  day20(process.argv[2]).then(console.log);
}

function count(nodes)
{
  const stack = [];
  const pulses = { L: 0, H: 0 };

  stack.push([ 'broadcaster', 'L', 'button' ]);

  /* eslint-disable no-loop-func */
  while (stack.length)
  {
    const jobs = [];

    stack.forEach(([ target, pulse, origin ]) =>
    {
      pulses[pulse]++;
      if (! (target in nodes)) { return; }
      const [ type, destinations, state ] = nodes[target];
      if (type === 'b')
      {
        destinations.forEach(n => jobs.push([ n, pulse, target ]));
      }
      else if (type === '%')
      {
        if (pulse === 'L')
        {
          nodes[target][2] = state === 'L' ? 'H' : 'L';
          destinations.forEach(n =>
            jobs.push([ n, state === 'H' ? 'L' : 'H', target ]));
        }
      }
      else if (type === '&')
      {
        state[origin] = pulse;

        const out = Object.values(state).every(v => v === 'H') ? 'L' : 'H';

        destinations.forEach(n => jobs.push([ n, out, target ]));
      }
    });

    stack.length = 0;
    stack.push(...jobs);
  }

  return pulses;
}

function getMagic(nodes)
{
  const stack = [];

  const magic = { ch: -1, gh: -1, sv: -1, th: -1 };

  let pushes = 0;

  while (Object.values(magic).some(v => v < 0))
  {
    // Button pushed
    pushes++;

    stack.push([ 'broadcaster', 'L', 'button' ]);

    /* eslint-disable no-loop-func */
    while (stack.length)
    {
      const jobs = [];

      stack.forEach(([ target, pulse, origin ]) =>
      {
        if (target === 'cn' && pulse === 'H' && magic[origin] < 0)
        {
          // Update magic numbers
          magic[origin] = pushes;
        }

        if (! (target in nodes)) { return; }

        const [ type, destinations, state ] = nodes[target];
        if (type === 'b')
        {
          destinations.forEach(n => jobs.push([ n, pulse, target ]));
        }
        else if (type === '%')
        {
          if (pulse === 'L')
          {
            nodes[target][2] = state === 'L' ? 'H' : 'L';
            destinations.forEach(n =>
              jobs.push([ n, state === 'H' ? 'L' : 'H', target ]));
          }
        }
        else if (type === '&')
        {
          state[origin] = pulse;

          const out = Object.values(state).every(v => v === 'H') ? 'L' : 'H';

          destinations.forEach(n => jobs.push([ n, out, target ]));
        }
      });

      stack.length = 0;
      stack.push(...jobs);
    }
  }

  return magic;
}

function getNodes(data)
{
  const nodes = data
    .map(line => [ line.charAt(0),
      ...line.replace(/[%& ]/g, '').split('->') ])
    .reduce((a, [ type, name, dest ]) =>
    {
      a[name] = [
        type,
        dest.split(','),
        type === '%' ? 'L' : type === '&' ? {} : 'none'
      ];
      return a;
    }, {});

  // Add inputs to all '&' modules
  Object.entries(nodes)
    .forEach(([ k, [ , dest ] ]) =>
    {
      dest.forEach(d =>
      {
        if (nodes[d]?.[0] === '&')
        {
          nodes[d][2][k] = 'low';
        }
      });
    });

  debug(nodes);

  return nodes;
}

function solve1(data)
{
  const nodes = getNodes(data);

  const total = { H: 0, L: 0 };

  for (let i = 0; i < 1000; i++)
  {
    const counts = count(nodes);
    total.L += counts.L;
    total.H += counts.H;
  }
  debug('totals:', total);

  return total.H * total.L;
}

function solve2(data)
{
  const nodes = getNodes(data);

  const magic = getMagic(nodes);
  debug('magic numbers:', magic);

  return lcm(...Object.values(magic));
}

export default async function day20(target)
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
  const expect1 = 32000000;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }
  if (target.includes('example2') && part1 !== 11687500)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; 11687500`);
  }
  if (target.includes('data.txt') && part1 !== 818723272)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; 818723272`);
  }

  const part2 = solve2(data);
  const expect2 = 243902373381257;
  if (target.includes('data.txt') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day20', part1, part2, duration: Date.now() - start };
}
