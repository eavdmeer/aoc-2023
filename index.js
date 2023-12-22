import fs from 'fs/promises';

const report = v =>
{
  console.log(`${v.day} solved in ${v.duration} ms`);
  return v;
};

async function run()
{
  const files = await fs.readdir('.');

  const dirs = files.filter(n => /^day\d\d$/.test(n));
  console.log('Working on', dirs.length, 'days');

  const results = [];
  for (let i = 0; i < dirs.length; i++)
  {
    const d = dirs[i];
    /* eslint-disable-next-line no-await-in-loop */
    results.push(await import(`./${d}/index.js`)
      .then(m => m.default(`./${d}/data.txt`))
      .then(report));
  }
  console.log(results);
}
run();
