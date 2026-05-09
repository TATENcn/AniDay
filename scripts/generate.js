import { JSONFilePreset } from 'lowdb/node';
import fs from 'fs';
import path from 'path';

async function generate() {
  console.log('Generating static JSON files from LowDB...');
  
  const outputDir = 'public/data';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const defaultData = { characters: [], backgrounds: {} };
  const db = await JSONFilePreset('db.json', defaultData);

  // 1. Generate month/day.json
  const dataMap = {};
  db.data.characters.forEach(char => {
    const key = `${char.month}/${char.day}`;
    if (!dataMap[key]) dataMap[key] = [];
    dataMap[key].push({
      id: char.id,
      name: char.name,
      work: char.work,
      avatar: char.avatar,
      bg: char.bg,
      music: char.music,
      quotes: char.quotes
    });
  });

  for (const key in dataMap) {
    const [m, d] = key.split('/');
    const dir = path.join(outputDir, m);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(
      path.join(dir, `${d}.json`),
      JSON.stringify({ date: `${m}-${d}`, characters: dataMap[key] }, null, 2)
    );
  }

  // 2. Generate search_index.json
  console.log('Generating search index...');
  const searchIndex = db.data.characters.map(c => ({
    n: c.name,
    w: c.work,
    m: c.month,
    d: c.day
  }));
  fs.writeFileSync(path.join(outputDir, 'search_index.json'), JSON.stringify(searchIndex));

  // 3. Generate background.json
  console.log('Generating background config...');
  fs.writeFileSync(path.join(outputDir, 'background.json'), JSON.stringify(db.data.backgrounds, null, 2));

  console.log('Generation completed.');
}

generate();
