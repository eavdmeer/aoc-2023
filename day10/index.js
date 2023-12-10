import * as fs from 'fs/promises';
import makeDebug from 'debug';
import assert from 'assert';

const debug = makeDebug('day10');

if (process.argv[2])
{
  day10(process.argv[2]).then(console.log);
}

const showMap = m => debug(m.map(r => r.join(' ')).join('\n'));

function parseData(data)
{
  /* eslint-disable quote-props */
  const directions = {
    'S': 'X',
    '.': '',
    'L': 'NE',
    '|': 'NS',
    '-': 'EW',
    'J': 'NW',
    '7': 'SW',
    'F': 'ES'
  };
  /* eslint-enable quote-props */

  const start = { r: -1, c: -1, dir: '', ch: '' };
  const map = data
    .map((line, r) => line
      .split('')
      .map((v, c) =>
      {
        if (v === 'S')
        {
          start.r = r;
          start.c = c;
        }
        return directions[v] ?? v;
      }));

  if (map[start.r - 1]?.[start.c]?.includes('S')) { start.dir += 'N'; }
  if (map[start.r]?.[start.c + 1]?.includes('W')) { start.dir += 'E'; }
  if (map[start.r + 1]?.[start.c]?.includes('N')) { start.dir += 'S'; }
  if (map[start.r]?.[start.c - 1]?.includes('E')) { start.dir += 'W'; }
  map[start.r][start.c] += start.dir;

  const idx = Object.values(directions).indexOf(start.dir);

  start.ch = Object.keys(directions).at(idx);

  return { map, start };
}

function walk(map, start, direction, path = [])
{
  path.push({ ...start, direction });

  const pos = { ...start };
  let ndir = direction;
  do
  {
    switch (ndir)
    {
      case 'N':
        pos.r--;
        break;
      case 'E':
        pos.c++;
        break;
      case 'S':
        pos.r++;
        break;
      case 'W':
        pos.c--;
        break;
      default:
        throw Error(`unknown direction: ${ndir}`);
    }

    const inv = { N: 'S', E: 'W', S: 'N', W: 'E' };

    ndir = map[pos.r][pos.c].replace(inv[ndir], '');

    if (ndir === '') { throw Error('no choices!'); }

    path.push({ ...pos, direction: ndir });
  } while (pos.r !== start.r || pos.c !== start.c);

  debug('reached start point in', path.length, 'steps');

  return path;
}

function solve1(data)
{
  const { map, start } = parseData(data);

  debug('start point:', start);

  const path = walk(map, { r: start.r, c: start.c }, start.dir[0]);

  debug(path);

  return Math.floor(path.length / 2);
}

function solve2(data)
{
  const { map, start } = parseData(data);

  debug('start point:', start);

  const path = walk(map, { r: start.r, c: start.c }, start.dir[0]);
  const rows = map.length;
  const cols = map[0].length;

  const nmap = [];
  for (let r = 0; r < rows; r++)
  {
    const row = new Array(cols).fill('.');
    nmap.push(row);
  }
  path.forEach(({ r, c }) => nmap[r][c] = data[r].charAt(c));
  nmap[start.r][start.c] = start.ch;

  showMap(nmap);

  let total = 0;
  nmap.forEach((row, r) =>
  {
    let inside = false;
    let up;
    row.forEach((ch, c) =>
    {
      switch (ch)
      {
        case '|':
          inside = ! inside;
          assert.ok(up === undefined, `| no up expected at (${r}, ${c})`);
          break;
        case '-':
          assert.ok(up !== undefined, `- up expected at (${r}, ${c})`);
          break;
        case 'L':
        case 'F':
          assert.ok(up === undefined, `LF no up expected at (${r}, ${c})`);
          up = ch === 'L';
          break;
        case '7':
        case 'J':
          assert.ok(up !== undefined, `7J up expected at (${r}, ${c})`);
          if (ch === (up ? '7' : 'J'))
          {
            inside = ! inside;
          }
          up = undefined;
          break;
        case '.':
          if (inside) { total++; }
          break;
        default:
          throw Error(`Unknown pipe: ${ch}`);
      }
    });
  });

  return total;
}

export default async function day10(target)
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
  const expect1 = 8;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 8;
  if (target.includes('example2') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day10', part1, part2, duration: Date.now() - start };
}
