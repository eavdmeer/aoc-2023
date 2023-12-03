import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day03');

const useHyperNeutrino = false;

if (process.argv[2])
{
  day03(process.argv[2]).then(console.log);
}

function neighbors(yp, xp)
{
  const res = [];
  for (let y = yp - 1; y <= yp + 1; y++)
  {
    if (y < 0) { continue; }
    for (let x = xp - 1; x <= xp + 1; x++)
    {
      if (x < 0 || x === xp && y === yp) { continue; }
      res.push([ y, x ]);
    }
  }

  return res;
}

function parseGrid(grid, symbolList)
{
  const w = grid[0].length;
  const h = grid.length;

  const symbols = [];
  const numbers = [];

  for (let y = 0; y < h; y++)
  {
    for (let x = 0; x < w; x++)
    {
      const ch = grid[y][x];

      if (/\d/.test(ch))
      {
        let xn;
        for (xn = x; xn < w; xn++)
        {
          if (! /\d/.test(grid[y][xn])) { break; }
        }
        const number = grid[y].slice(x, xn).join('');
        numbers.push({ number, x, y, xn });

        x = xn - 1;
      }
      else if (! /\d|\./.test(ch))
      {
        if (symbolList)
        {
          if (symbolList.includes(ch))
          {
            symbols.push({ x, y });
          }
        }
        else
        {
          symbols.push({ x, y });
        }
      }
    }
  }
  return { numbers, symbols };
}

function hyperNeutrino1(data)
{
  const grid = data.map(v => v.split(''));
  const w = grid[0].length;
  const h = grid.length;

  const cs = new Set();

  grid.forEach((row, r) =>
  {
    row.forEach((ch, c) =>
    {
      if (! isNaN(ch) || ch === '.') { return; }

      [ r - 1, r, r + 1 ].forEach(cr =>
      {
        [ c - 1, c, c + 1 ].forEach(cc =>
        {
          if (cr < 0 || cr >= h || cc < 0 || cc >= w || isNaN(grid[cr][cc]))
          {
            return;
          }
          let nc = cc;
          while (nc > 0 && ! isNaN(grid[cr][nc - 1]))
          {
            nc--;
          }
          cs.add(`${cr}:${nc}`);
        });
      });
    });
  });

  const ns = [];
  for (const entry of cs)
  {
    const [ r, c ] = entry.split(':').map(v => parseInt(v, 10));
    let i;
    for (i = c; i < w; i++)
    {
      if (isNaN(grid[r][i]))
      {
        break;
      }
    }
    ns.push(parseInt(grid[r].slice(c, i).join(''), 10));
  }

  return ns.reduce((a, v) => a + v, 0);
}

function hyperNeutrino2(data)
{
  const grid = data.map(v => v.split(''));
  const w = grid[0].length;
  const h = grid.length;

  let total = 0;

  grid.forEach((row, r) =>
  {
    row.forEach((ch, c) =>
    {
      if (ch !== '*') { return; }

      const cs = new Set();

      [ r - 1, r, r + 1 ].forEach(cr =>
      {
        [ c - 1, c, c + 1 ].forEach(cc =>
        {
          if (cr < 0 || cr >= h || cc < 0 || cc >= w || isNaN(grid[cr][cc]))
          {
            return;
          }
          let nc = cc;
          while (nc > 0 && ! isNaN(grid[cr][nc - 1]))
          {
            nc--;
          }
          cs.add(`${cr}:${nc}`);
        });
      });

      if (cs.size !== 2) { return; }

      const ns = [];
      for (const entry of cs)
      {
        const [ r1, c1 ] = entry.split(':').map(v => parseInt(v, 10));
        let i;
        for (i = c1; i < w; i++)
        {
          if (isNaN(grid[r1][i]))
          {
            break;
          }
        }
        ns.push(parseInt(grid[r1].slice(c1, i).join(''), 10));
      }

      total += ns[0] * ns[1];
    });
  });

  return total;
}

function solve1(data)
{
  if (useHyperNeutrino)
  {
    return hyperNeutrino1(data);
  }

  const grid = data.map(v => v.split(''));

  const { numbers, symbols } = parseGrid(grid);
  const isSymbol = symbols
    .reduce((a, v) =>
    {
      a[`${v.y}-${v.x}`] = true;
      return a;
    }, {});

  const res = numbers
    .map(n =>
    {
      for (let x = n.x; x < n.xn; x++)
      {
        if (neighbors(n.y, x).some(([ yn, xn ]) => isSymbol[`${yn}-${xn}`]))
        {
          return parseInt(n.number, 10);
        }
      }
      return 0;
    })
    .reduce((a, v) => a + v, 0);

  return res;
}

function solve2(data)
{
  if (useHyperNeutrino)
  {
    return hyperNeutrino2(data);
  }

  const grid = data.map(v => v.split(''));

  const { numbers, symbols } = parseGrid(grid, '*');

  return symbols
    .map(symbol =>
    {
      const hits = numbers.filter(({ x, y, xn }) =>
      {
        for (let xp = x; xp < xn; xp++)
        {
          if (Math.abs(xp - symbol.x) <= 1 && Math.abs(y - symbol.y) <= 1)
          {
            return true;
          }
        }
        return false;
      });

      return hits.length === 2 ?
        parseInt(hits[0].number, 10) * parseInt(hits[1].number, 10) :
        0;
    })
    .reduce((a, v) => a + v, 0);
}

export default async function day03(target)
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
  const expect1 = 4361 + 4 + 4 + 5;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 467835;
  if (target.includes('example2') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day03', part1, part2, duration: Date.now() - start };
}
