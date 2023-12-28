/*
 * From: https://github.com/borgbean/aoc-2023/blob/main/49.js
 * Author: beanborg
 *
 * I do a union find on the edges, picking the edges in a random order.
 * Eventually, there will be 2 top level groups - at which point I stop the
 * union find.
 *
 * Then, I loop over the edges and see if the vertices on both sides of the
 * edge are in the same group. If not, I consider the edge removed. If
 * there are exactly three removed edges, I multiply the size of the 2
 * groups.
 *
 * I repeat the whole process until I find a solution with 3 cut edges.
 */
import fs from 'fs/promises';

async function doIt()
{
  const rawInput = await fs.readFile(process.argv[2]);
  const lines = rawInput.toString().trim().split('\n');

  const edges = [];
  const vToId = new Map();

  for (const line of lines)
  {
    const [ v1, v2s ] = line.split(': ');

    if (! vToId.has(v1))
    {
      vToId.set(v1, vToId.size);
    }

    for (const v2 of v2s.split(' '))
    {
      if (! vToId.has(v2))
      {
        vToId.set(v2, vToId.size);
      }

      edges.push([ vToId.get(v1), vToId.get(v2) ]);
    }
  }

  /* eslint-disable-next-line no-constant-condition */
  while (true)
  {
    const groups = unionFindThingy(vToId.size, edges, 3);

    if (groups !== null)
    {
      const group1Count = groups.filter(x => x === groups[0]).length;
      return group1Count * (vToId.size - group1Count);
    }
  }
}

function unionFindThingy(vertexCount, edges, desiredCuts)
{
  // shuffle
  for (let i = 0; i < edges.length; ++i)
  {
    const idx = Math.floor(Math.random() * i + 1);
    [ edges[i], edges[idx] ] = [ edges[idx], edges[i] ];
  }

  const groupParents = [ -1 ];
  const vertexGroups = new Uint16Array(vertexCount);
  const groupPromotions = [ -1 ];

  function union(v1, v2)
  {
    if (! vertexGroups[v1] && ! vertexGroups[v2])
    {
      const group = groupParents.length;
      groupParents.push(group);
      groupPromotions.push(1);
      vertexGroups[v1] = group;
      vertexGroups[v2] = group;
    }
    else if (! vertexGroups[v1])
    {
      const g = parent(v2);
      vertexGroups[v2] = g;
      ++groupPromotions[g];
      vertexGroups[v1] = g;
    }
    else if (! vertexGroups[v2])
    {
      const g = vertexGroups[v1];
      vertexGroups[v1] = g;
      ++groupPromotions[g];
      vertexGroups[v2] = g;
    }
    else
    {
      let g1 = parent(v1);
      let g2 = parent(v2);

      if (g1 !== g2)
      {
        if (groupPromotions[g1] > groupPromotions[g2])
        {
          [ g2, g1 ] = [ g1, g2 ];
        }

        groupPromotions[g2] += groupPromotions[g1] + 1;

        groupParents[g1] = g2;

        vertexGroups[v1] = g2;
        vertexGroups[v2] = g2;
      }
      else
      {
        return false;
      }
    }

    return true;
  }

  function parent(v)
  {
    if (vertexGroups[v] === 0)
    {
      return -1;
    }

    let group = vertexGroups[v];
    while (group !== groupParents[group])
    {
      group = groupParents[group];
    }

    return group;
  }

  let edgeIdx = 0;
  let cnt = vertexCount;
  while (cnt > 2)
  {
    const [ v1, v2 ] = edges[edgeIdx++];

    if (union(v1, v2))
    {
      cnt--;
    }
  }

  let removedEdges = 0;
  for (const [ v1, v2 ] of edges)
  {
    if ((vertexGroups[v1] = parent(v1)) !== (vertexGroups[v2] = parent(v2)))
    {
      removedEdges++;
    }
  }

  if (removedEdges === desiredCuts)
  {
    return vertexGroups;
  }

  return null;
}

console.time();
doIt()
  .then(v =>
  {
    console.log(v);
    console.timeEnd();
  });
