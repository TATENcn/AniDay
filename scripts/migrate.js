import { JSONFilePreset } from 'lowdb/node';
import fs from 'fs';
import path from 'path';

async function migrate() {
  console.log('Initializing LowDB...');
  
  // Default data structure
  const defaultData = { 
    characters: [], 
    backgrounds: {} 
  };
  
  const db = await JSONFilePreset('db.json', defaultData);

  // 1. Migrate Backgrounds
  console.log('Migrating backgrounds...');
  const bgPath = 'data/background.json';
  if (fs.existsSync(bgPath)) {
    try {
      const bgData = JSON.parse(fs.readFileSync(bgPath, 'utf8'));
      db.data.backgrounds = bgData;
      await db.write();
    } catch (e) {
      console.warn('Background data failed to migrate:', e.message);
    }
  }

  // 2. Migrate Characters
  console.log('Migrating characters...');
  const dataDir = 'data';
  const months = fs.readdirSync(dataDir).filter(f => !isNaN(f));

  const allChars = [];
  let idCounter = 1;

  for (const month of months) {
    const monthPath = path.join(dataDir, month);
    const files = fs.readdirSync(monthPath).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const day = file.replace('.json', '');
      const filePath = path.join(monthPath, file);
      
      try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) continue;

        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const characterList = Array.isArray(content) ? content : (content.characters || []);

        for (const char of characterList) {
          allChars.push({
            id: idCounter++,
            name: char.name || '',
            work: char.work || char.anime || '',
            avatar: char.avatar || char.image_url || '',
            month: parseInt(month),
            day: parseInt(day),
            bg: char.bg || null,
            music: char.music || null,
            quotes: char.quotes || []
          });
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err.message);
      }
    }
  }

  db.data.characters = allChars;
  await db.write();

  console.log(`Migration completed. Total characters: ${allChars.length}`);
}

migrate();
