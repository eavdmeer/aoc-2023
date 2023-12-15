import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day15');

const useHyperNeutrino = false;

if (process.argv[2])
{
  day15(process.argv[2]).then(console.log);
}

function hash(data)
{
  let result = 0;

  for (let i = 0; i < data.length; i++)
  {
    // Increase the current value by the ASCII code you just determined.
    result += data.charCodeAt(i);

    // Set the current value to itself multiplied by 17.
    result *= 17;

    // Set the current value to the remainder of dividing itself by 256.
    result %= 256;
  }
  return result;
}

function solve1(data)
{
  return data
    .split(',')
    .map(v => hash(v))
    .reduce((a, v) => a + v, 0);
}

function hyperNeutrino2(data)
{
  const boxes = [];
  for (let i = 0; i < 256; i++) { boxes.push([]); }

  const focalLengths = {};

  data.split(',').forEach(instruction =>
  {
    if (instruction.includes('-'))
    {
      const label = instruction.replace('-', '');
      const index = hash(label);
      if (boxes[index].includes(label))
      {
        boxes[index].splice(boxes[index].indexOf(label), 1);
      }
    }
    else
    {
      const [ label, length ] = instruction.split('=');
      const index = hash(label);
      if (! boxes[index].includes(label))
      {
        boxes[index].push(label);
      }
      focalLengths[label] = parseInt(length, 10);
    }
  });

  let total = 0;

  boxes.forEach((box, boxNumber) =>
  {
    box.forEach((label, lensSlot) =>
    {
      total += (boxNumber + 1) * (lensSlot + 1) * focalLengths[label];
    });
  });

  return total;
}

function solve2(data)
{
  if (useHyperNeutrino)
  {
    return hyperNeutrino2(data);
  }

  const ops = [];
  const re = /([a-z]+)([=-])(\d+)?/g;
  const it = data.matchAll(re);
  for (const m of it)
  {
    ops.push({
      label: m[1],
      box: hash(m[1]),
      op: m[2],
      f: m[3] ? parseInt(m[3], 10) : -1
    });
  }
  debug('have', ops.length, 'operations');

  const boxes = new Map();

  ops.forEach(step =>
  {
    if (! boxes.has(step.box))
    {
      if (step.op === '-') { return; }
      boxes.set(step.box, [ { label: step.label, f: step.f } ]);
      return;
    }

    const box = boxes.get(step.box);
    const idx = box.length ? box.findIndex(v => v.label === step.label) : -1;

    if (step.op === '=')
    {
      if (idx < 0)
      {
        box.push({ label: step.label, f: step.f });
      }
      else
      {
        box[idx].f = step.f;
      }
    }
    else if (idx >= 0)
    {
      box.splice(idx, 1);
      if (box.length === 0) { boxes.delete(step.box); }
    }
  });

  debug(boxes);

  let total = 0;
  boxes.forEach((lenses, key) =>
  {
    total += (key + 1) *
      lenses.map((lens, i) => (i + 1) * lens.f).reduce((a, v) => a + v, 0);
  });

  return total;
}

export default async function day15(target)
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
  const expect1 = 1320;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 145;
  if (target.includes('example2') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }
  if (target.includes('data.txt') && part2 !== 231844)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; 231844`);
  }

  return { day: 'day15', part1, part2, duration: Date.now() - start };
}
