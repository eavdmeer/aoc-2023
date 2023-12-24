#!/usr/bin/env node

import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day23');

if (process.argv[2])
{
  day23(process.argv[2])
    .then(console.log)
    .catch(err => console.log(err.message));
}

const kv = (r, c, d) => `${r},${c}${d ? `:${d}` : ''}`;

const dkv = str => str.split(',').map(Number);

function neighbors(grid, r, c, d)
{
  const back = { U: 'D', D: 'U', R: 'L', L: 'R' };

  const points = [
    [ r - 1, c, 'U' ],
    [ r + 1, c, 'D' ],
    [ r, c - 1, 'L' ],
    [ r, c + 1, 'R' ]
  ];

  return points.filter(([ pr, pc, pd ]) =>
    pr > 0 && pr < grid.h &&
    pc > 0 && pc < grid.w &&
    grid[pr][pc] !== '#' &&
    pd !== back[d] &&
    ! /^(Uv|D^|R<|L>$)/.test(`${pd}${grid[pr][pc]}`));
}

function fwalk(grid, sr, sc, er, ec)
{
  const graph = new Map();

  const stack = [ [ sr, sc, 'X', 0, sr, sc ] ];
  const seen = new Set();

  while (stack.length > 0)
  {
    const [ r, c, d, n, srcR, srcC ] = stack.shift();

    if (seen.has(kv(r, c))) { continue; }

    const next = neighbors(grid, r, c, d);
    if (next.length > 1 || r === er && c === ec)
    {
      const key = kv(srcR, srcC);
      const val = graph.get(key) ?? [];
      val.push({ kv: kv(r, c), n });
      graph.set(key, val);
      stack.push(...next.map(v => [ ...v, n + 1, r, c ]));
    }
    else
    {
      stack.push(...next.map(v => [ ...v, n + 1, srcR, srcC ]));
    }
  }

  console.log(graph);
}

function walk(grid, sr, sc, er, ec, dir = 'X')
{
  const stack = [];

  stack.push({ cost: 0, r: sr, c: sc, d: dir, seen: new Set() });

  const answers = [];
  while (stack.length > 0)
  {
    debug('stack:', stack.length);
    const { cost, r, c, d, seen } = stack.shift();
    debug({ cost, r, c, d });
    if (seen.has(kv(r, c))) { continue; }

    seen.add(kv(r, c, d));

    if (r === er && c === ec)
    {
      answers.push({ seen, cost });
      continue;
    }

    const next = neighbors(grid, r, c, d);
    debug('next:', next);
    next.forEach(([ nr, nc, nd ]) => stack.push(
      { cost: cost + 1, r: nr, c: nc, d: nd, seen: new Set(seen) }));
  }

  const max = Math.max(...answers.map(v => v.cost));

  return answers.find(v => v.cost === max);
}

function drawPath(grid, seen)
{
  Array.from(seen).forEach(k =>
  {
    const [ pr, pc ] = k.split(':').at(0).split(',').map(Number);
    const l = grid[pr].split('');
    l[pc] = 'O';
    if (/^[<>v^]$/.test(grid[pr][pc])) { return; }
    grid[pr] = l.join('');
  });
  console.log(grid.join('\n'));
}

function solve1(data)
{
  const sc = data[0].indexOf('.');
  const sr = 0;
  const ec = data.at(-1).indexOf('.');
  const er = data.length - 1;

  debug('start:', sr, sc);
  debug('end:', er, ec);

  data.w = data[0].length;
  data.h = data.length;

  const res = walk(data, sr, sc, er, ec);
  if (debug.enabled)
  {
    drawPath(data, res.seen);
  }

  return res.cost;
}

function next(grid, r, c)
{
  const points = [
    [ r - 1, c, 'U' ],
    [ r + 1, c, 'D' ],
    [ r, c - 1, 'L' ],
    [ r, c + 1, 'R' ]
  ];
  return points.filter(([ nr, nc ]) =>
    nr >= 0 && nr < grid.h &&
    nc >= 0 && nc < grid.w &&
    grid[nr][nc] !== '#');
}

const gseen = new Set();

function dfs(graph, r, c, rEnd, cEnd)
{
  if (r === rEnd && c === cEnd) { return 0; }

  let m = Number.NEGATIVE_INFINITY;
  m = 0;

  gseen.add(kv(r, c));

  const routes = graph.get(kv(r, c));
  Object.keys(routes).forEach(txt =>
  {
    const [ nr, nc ] = dkv(txt);
    if (! gseen.has(kv(nr, nc)))
    {
      m = Math.max(m, dfs(graph, nr, nc) + routes[txt]);
    }
  });

  gseen.delete(kv(r, c));

  return m;
}

function oink(grid, startRow, startCol, endRow, endCol)
{
  const points = new Set([ kv(startRow, startCol), kv(endRow, endCol) ]);

  grid.forEach((row, r) =>
  {
    row.split('').forEach((ch, c) =>
    {
      if (ch === '#') { return; }
      let nb = 0;
      next(grid, r, c).forEach(([ nr, nc ]) =>
      {
        if (nr >= 0 && nr < grid.h && nc >= 0 && nc < grid.w &&
          grid[nr][nc] !== '#')
        {
          nb++;
        }
        if (nb >= 3)
        {
          points.add(kv(r, c));
        }
      });
    });
  });

  const graph = new Map();

  for (const str of points)
  {
    const [ sr, sc ] = dkv(str);
    const stack = [ [ 0, sr, sc ] ];
    const seen = new Set();
    seen.add(kv(sr, sc));

    while (stack.length > 0)
    {
      const [ n, r, c ] = stack.pop();

      if (n !== 0 && points.has(kv(r, c)))
      {
        const val = graph.get(kv(sr, sc)) ?? {};
        val[kv(r, c)] = n;
        graph.set(kv(sr, sc), val);
        continue;
      }

      next(grid, r, c).forEach(([ nr, nc ]) =>
      {
        if (seen.has(kv(nr, nc))) { return; }
        stack.push([ n + 1, nr, nc ]);
        seen.add(kv(nr, nc));
      });
    }
  }

  console.log(graph);

  return dfs(graph, startRow, startCol, endRow, endCol);
}

function solve2(data)
{
  const sc = data[0].indexOf('.');
  const sr = 0;
  const ec = data.at(-1).indexOf('.');
  const er = data.length - 1;

  debug('start:', sr, sc);
  debug('end:', er, ec);

  const ndata = data.map(line => line.replace(/[<>v^]/g, '.'));
  ndata.w = ndata[0].length;
  ndata.h = ndata.length;

  return oink(ndata, sr, sc, er, ec);
}

export default async function day23(target)
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
  console.log('part1 solution:', part1);
  const expect1a = 94;
  if (target.includes('example') && part1 !== expect1a)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1a}`);
  }
  const expect1b = 2254;
  if (target === 'data.txt' && part1 !== expect1b)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1b}`);
  }

  const part2 = 0;
  /*
  const part2 = solve2(data);
  const expect2a = 154;
  if (target.includes('example') && part2 !== expect2a)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2a}`);
  }
  const expect2b = 6394;
  if (target === 'data.txt' && part2 !== expect2b)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2b}`);
  }
  */

  return { day: 'day23', part1, part2, duration: Date.now() - start };
}
