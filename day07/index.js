import * as fs from 'fs/promises';
import makeDebug from 'debug';

const debug = makeDebug('day07');

if (process.argv[2])
{
  day07(process.argv[2]).then(console.log);
}

function value(card, joker = false)
{
  const values = { T: 'A', J: 'B', Q: 'C', K: 'D', A: 'E' };
  return joker && card === 'J' ? 0 : values[card] ?? card;
}

function frequencies(hand)
{
  const m = hand
    .split('')
    .reduce((m, v) => { m.set(v, m.has(v) ? m.get(v) + 1 : 1); return m; },
      new Map());

  return new Map([ ...m ].sort((v1, v2) => v2[1] - v1[1]));
}

function compare(hand1, hand2)
{
  const n1 = Array.from(frequencies(hand1).values());
  const n2 = Array.from(frequencies(hand2).values());

  if (n1 > n2)
  {
    return 1;
  }
  if (n1 < n2)
  {
    return -1;
  }
  return hand1.split('').map(v => value(v)) >
    hand2.split('').map(v => value(v)) ? 1 : -1;
}

function solve1(data)
{
  const order = data
    .map(v => v.split(' ')).map(v => [ v[0], parseInt(v[1], 10) ])
    .sort((v1, v2) => compare(v1[0], v2[0]));

  const res = order
    .reduce((a, v, i) => a + (i + 1) * v[1], 0);

  return res;
}

function optimize(hand)
{
  const f = frequencies(hand);

  if (! f.has('J')) { return hand; }

  if (hand === 'JJJJJ') { return 'AAAAA'; }

  const it = f.keys();
  let bestChar = it.next();
  while (bestChar.value === 'J' && ! bestChar.done)
  {
    bestChar = it.next();
  }

  return hand.replace(/J/g, bestChar.value);
}

function compare2(p1, p2)
{
  const n1 = Array.from(frequencies(p1.best).values());
  const n2 = Array.from(frequencies(p2.best).values());

  if (n1 > n2)
  {
    return 1;
  }
  if (n1 < n2)
  {
    return -1;
  }

  const s1 = p1.hand.includes('J') ? p1.hand : p1.best;
  const s2 = p2.hand.includes('J') ? p2.hand : p2.best;

  return s1.split('').map(v => value(v, true)) >
    s2.split('').map(v => value(v, true)) ? 1 : -1;
}

function solve2(data)
{
  const hands = data
    .map(v => v.split(' ')).map(v => [ v[0], parseInt(v[1], 10) ]);

  const optimized = hands
    .map(([ hand, bid ]) => ({ hand, bid, best: optimize(hand) }));

  const order = optimized
    .sort((v1, v2) => compare2(v1, v2));

  debug(order);

  const res = order
    .reduce((a, v, i) => a + (i + 1) * v.bid, 0);

  return res;
}

export default async function day07(target)
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
  const expect1 = 6440;
  if (target.includes('example1') && part1 !== expect1)
  {
    throw new Error(`Invalid part 1 solution: ${part1}. Expecting; ${expect1}`);
  }

  const part2 = solve2(data);
  const expect2 = 5905;
  if (target.includes('example') && part2 !== expect2)
  {
    throw new Error(`Invalid part 2 solution: ${part2}. Expecting; ${expect2}`);
  }

  return { day: 'day07', part1, part2, duration: Date.now() - start };
}
