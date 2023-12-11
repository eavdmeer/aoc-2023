import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day11');

if (process.argv[2])
{
  day11(process.argv[2]).then(console.log);
}

function transpose(matrix)
{
  const result = [];

  for (let i = 0; i < matrix[0].length; i++) { result.push([]); }

  matrix.forEach(row =>
  {
    row.forEach((col, c) => result[c].push(col));
  });

  return result;
}

function expand(matrix)
{
  const phase1 = [];

  matrix.forEach(row =>
  {
    phase1.push(row);
    if (! row.includes('#')) { phase1.push([ ...row ]); }
  });

  const t = transpose(phase1);

  const phase2 = [];

  t.forEach(row =>
  {
    phase2.push(row);
    if (! row.includes('#')) { phase2.push([ ...row ]); }
  });

  return transpose(phase2);
}

function findGalaxies(universe)
{
  const galaxies = [];
  universe.forEach((row, r) =>
  {
    row.forEach((ch, c) =>
    {
      if (ch === '#') { galaxies.push({ r, c }); }
    });
  });
  return galaxies;
}

function solve1(data)
{
  const universe = expand(data.map(v => v.split('')));

  debug('universe:');
  debug(universe.map(v => v.join('')).join('\n'));

  universe.height = universe.length;
  universe.width = universe[0].length;

  const galaxies = findGalaxies(universe);
  debug('galaxies:', galaxies);

  let total = 0;
  for (let g1 = 0; g1 < galaxies.length; g1++)
  {
    for (let g2 = g1 + 1; g2 < galaxies.length; g2++)
    {
      const gal1 = galaxies[g1];
      const gal2 = galaxies[g2];
      const d = Math.abs(gal1.c - gal2.c) + Math.abs(gal1.r - gal2.r);
      debug('distance between galaxies', g1, 'and', g2, 'is:', d);
      total += d;
    }
  }

  return total;
}

function solve2(data, scaling = 1000000)
{
  const universe = data.map(v => v.split(''));

  debug('universe;');
  debug(universe.map(v => v.join('')).join('\n'));

  universe.height = universe.length;
  universe.width = universe[0].length;

  const emptyRows = [];
  const emptyCols = [];

  universe.forEach((row, r) =>
  {
    if (! row.includes('#')) { emptyRows.push(r); }
  });
  for (let c = 0; c < universe.width; c++)
  {
    if (universe.every(row => row[c] !== '#'))
    {
      emptyCols.push(c);
    }
  }

  debug('empty rows:', emptyRows);
  debug('empty cols:', emptyCols);

  const galaxies = findGalaxies(universe);
  debug('galaxies:', galaxies);

  const remapped = galaxies.map(({ r, c }) =>
    ({
      r: r + (scaling - 1) * emptyRows.filter(er => er < r).length,
      c: c + (scaling - 1) * emptyCols.filter(ec => ec < c).length
    }));

  debug('remapped:', remapped);

  const manhatten = (p1, p2) => Math.abs(p1.c - p2.c) +
    Math.abs(p1.r - p2.r);

  let total = 0;
  for (let g1 = 0; g1 < remapped.length; g1++)
  {
    for (let g2 = g1 + 1; g2 < remapped.length; g2++)
    {
      const d = manhatten(remapped[g1], remapped[g2]);
      debug('distance between galaxies', g1, 'and', g2, 'is:', d);
      total += d;
    }
  }

  return total;
}

export default async function day11(target)
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
  const expect1 = 374;
  if (target.includes('example') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data, target.includes('example') ? 10 : 1000000);
  const expect2 = 1030;
  if (target.includes('example') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day11', part1, part2, duration: Date.now() - start };
}
