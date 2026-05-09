import { JSONFilePreset } from 'lowdb/node';

async function upgrade() {
  console.log('Upgrading db.json structure...');
  
  const defaultData = { characters: [], backgrounds: {} };
  const db = await JSONFilePreset('db.json', defaultData);

  // 1. Add Metadata if not exists
  if (!db.data.metadata) {
    db.data.metadata = {
      version: "1.1.0",
      last_updated: new Date().toISOString().split('T')[0],
      total_characters: db.data.characters.length
    };
  } else {
    db.data.metadata.last_updated = new Date().toISOString().split('T')[0];
    db.data.metadata.total_characters = db.data.characters.length;
  }

  // 2. Add default values for new fields to existing characters
  db.data.characters = db.data.characters.map(char => ({
    ...char,
    cv: char.cv || "",
    tags: char.tags || [],
    color: char.color || null,
    source_url: char.source_url || "",
    quotes: char.quotes && char.quotes.length > 0 ? char.quotes : ["生日快乐"]
  }));

  await db.write();
  console.log('Upgrade completed.');
}

upgrade();
