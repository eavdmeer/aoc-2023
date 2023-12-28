#!/usr/bin/env node

import * as fs from 'fs/promises';
import makeDebug from 'debug';
import { MinPriorityQueue } from '@datastructures-js/priority-queue';

const debug = makeDebug('day25');

if (process.argv[2])
{
  day25(process.argv[2])
    .then(console.log)
    .catch(err => console.log(err.message));
}

const kv = (a, b) => [ a, b ].sort().join('->');

function solve1(data)
{
  const connections = data
    .sort()
    .map(line => line.split(': '))
    .reduce((a, v) => { a[v[0]] = v[1].split(' '); return a; }, {});

  debug('connections:', connections);

  // Set up vertices hit count map
  const vertices = new Map();
  Object.entries(connections).forEach(([ k, v ]) =>
  {
    v.forEach(l => vertices.set(kv(k, l), 0));
  });
  debug('vertices:', vertices);

  const list = Object.keys(connections);
  list.forEach(v => list.push(...connections[v]));
  list.sort();

  const components = new Set(list);
  debug('components:', components);

  components.forEach(name =>
  {
    if (! connections[name]) { connections[name] = []; }
  });

  Object.entries(connections).forEach(([ k, v ]) =>
  {
    v.forEach(n =>
    {
      if (! connections[n].includes(k)) { connections[n].push(k); }
    });
  });
  Object.values(connections).forEach(v => v.sort());

  debug('fixed connections:', connections);

  // 1. Set up a list of vertices
  // 2. For each node, find the shortest path to every other node while
  //   updating the visited count for each vertex travelled
  // 3. Sort vertices by most visited
  // 4. Eliminate the 3 most visited nodes
  // 5. Find the length of the 2 subgraphs
  components.forEach(name =>
  {
    debug('working on', name);
    const heap = new MinPriorityQueue(v => v.d);
    const dist = new Map();

    connections[name].forEach(n => heap.push({ n, d: 1, seen: new Set() }));

    while (heap.size())
    {
      const { n, d, seen } = heap.dequeue();
      // debug(n, d, seen);
      if (seen.has(n) || n === name) { continue; }
      dist.set(kv(name, n), d);
      seen.add(n);
      if (vertices.has(kv(name, n)))
      {
        vertices.set(kv(name, n), vertices.get(kv(name, n)) + 1);
      }
      if (dist.size === components.size)
      {
        break;
      }
      connections[n].forEach(n2 =>
        heap.push({ n: n2, d: d + 1, seen: new Set(seen) }));
    }
  });

  const lose = [ ...vertices.entries() ]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(v => v[0]);

  debug('disconnect vertices:', lose);

  // Cut connections
  lose.forEach(txt =>
  {
    const [ from, to ] = txt.split('->');
    connections[from] = connections[from]
      .filter(n => n !== to);
    connections[to] = connections[to]
      .filter(n => n !== from);
  });

  debug('updated connections:', connections);

  const [ net1 ] = lose[0].split('->');
  debug('finding nodes for', net1);

  const seen = new Set();
  const stack = [ net1 ];
  while (stack.length)
  {
    const n = stack.shift();
    if (seen.has(n)) { continue; }
    seen.add(n);
    stack.push(...connections[n]);
  }

  debug('network', net1, 'has', seen.size, 'nodes');

  return seen.size * (components.size - seen.size);
}

export default async function day25(target)
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
  const expect1a = 54;
  if (target.includes('example') && part1 !== expect1a)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1a}`);
  }
  const expect1b = 569904;
  if (target === 'data.txt' && part1 !== expect1b)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1b}`);
  }

  return { day: 'day25', part1, part2: 'bye!', duration: Date.now() - start };
}
