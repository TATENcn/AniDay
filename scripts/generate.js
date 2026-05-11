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
    d: c.day,
    cv: c.cv
  }));
  fs.writeFileSync(path.join(outputDir, 'search_index.json'), JSON.stringify(searchIndex));

  // 3. Generate background.json
  console.log('Generating background config...');
  fs.writeFileSync(path.join(outputDir, 'background.json'), JSON.stringify(db.data.backgrounds, null, 2));

  // 4. Generate work index (按作品生成角色生日表)
  console.log('Generating work index...');
  const workMap = {};
  db.data.characters.forEach(char => {
    if (!char.work) return;
    if (!workMap[char.work]) {
      workMap[char.work] = {
        work: char.work,
        characters: []
      };
    }
    workMap[char.work].characters.push({
      id: char.id,
      name: char.name,
      month: char.month,
      day: char.day,
      avatar: char.avatar,
      cv: char.cv
    });
  });
  // 按生日排序每个作品的角色
  for (const work in workMap) {
    workMap[work].characters.sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });
  }
  const workIndexDir = path.join(outputDir, 'works');
  if (!fs.existsSync(workIndexDir)) fs.mkdirSync(workIndexDir, { recursive: true });
  const workList = Object.values(workMap);
  fs.writeFileSync(path.join(workIndexDir, 'list.json'), JSON.stringify(workList.map(w => w.work), null, 2));
  for (const work in workMap) {
    const filename = encodeURIComponent(work) + '.json';
    fs.writeFileSync(path.join(workIndexDir, filename), JSON.stringify(workMap[work], null, 2));
  }

  // 5. Generate CV index (按CV生成角色列表)
  console.log('Generating CV index...');
  const cvMap = {};
  db.data.characters.forEach(char => {
    if (!char.cv) return;
    if (!cvMap[char.cv]) {
      cvMap[char.cv] = {
        cv: char.cv,
        characters: []
      };
    }
    cvMap[char.cv].characters.push({
      id: char.id,
      name: char.name,
      work: char.work,
      month: char.month,
      day: char.day,
      avatar: char.avatar
    });
  });
  // 按生日排序每个CV的角色
  for (const cv in cvMap) {
    cvMap[cv].characters.sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });
  }
  const cvIndexDir = path.join(outputDir, 'cvs');
  if (!fs.existsSync(cvIndexDir)) fs.mkdirSync(cvIndexDir, { recursive: true });
  const cvList = Object.keys(cvMap);
  fs.writeFileSync(path.join(cvIndexDir, 'list.json'), JSON.stringify(cvList, null, 2));
  for (const cv in cvMap) {
    const filename = encodeURIComponent(cv) + '.json';
    fs.writeFileSync(path.join(cvIndexDir, filename), JSON.stringify(cvMap[cv], null, 2));
  }

  console.log('Generation completed.');
}

generate();
