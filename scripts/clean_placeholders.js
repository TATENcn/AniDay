import { JSONFilePreset } from 'lowdb/node';

async function clean() {
  console.log('Cleaning up placeholder URLs in db.json...');
  
  const defaultData = { characters: [], backgrounds: {} };
  const db = await JSONFilePreset('db.json', defaultData);

  let cleanedCount = 0;

  // 1. Clean Backgrounds
  if (db.data.backgrounds) {
    for (const m in db.data.backgrounds) {
      for (const d in db.data.backgrounds[m]) {
        const url = db.data.backgrounds[m][d].url;
        if (url && url.includes('example.com')) {
          db.data.backgrounds[m][d].url = "";
          cleanedCount++;
        }
      }
    }
  }

  // 2. Clean Characters (just in case)
  db.data.characters.forEach(char => {
    if (char.bg && char.bg.includes('example.com')) {
      char.bg = null;
      cleanedCount++;
    }
    if (char.avatar && char.avatar.includes('example.com')) {
      char.avatar = "";
      cleanedCount++;
    }
  });

  await db.write();
  console.log(`Cleanup completed. Removed ${cleanedCount} placeholder URLs.`);
}

clean();
