import { JSONFilePreset } from 'lowdb/node';

async function updatePaths() {
  console.log('Updating resource paths in db.json...');
  
  const defaultData = { characters: [], backgrounds: {} };
  const db = await JSONFilePreset('db.json', defaultData);

  // 1. Update Character Avatar paths
  db.data.characters = db.data.characters.map(char => {
    let avatar = char.avatar || "";
    // If it starts with img/, change to /avatar/
    if (avatar.startsWith('img/')) {
      avatar = avatar.replace('img/', '/avatar/');
    } else if (avatar && !avatar.startsWith('http') && !avatar.startsWith('/')) {
      avatar = '/avatar/' + avatar;
    }

    let bg = char.bg;
    if (bg && !bg.startsWith('http') && !bg.startsWith('/')) {
      bg = '/background/' + bg;
    }

    let music = char.music;
    if (music && !music.startsWith('http') && !music.startsWith('/')) {
      music = '/music/' + music;
    }

    return { ...char, avatar, bg, music };
  });

  // 2. Update Backgrounds paths
  if (db.data.backgrounds) {
    for (const m in db.data.backgrounds) {
      for (const d in db.data.backgrounds[m]) {
        let url = db.data.backgrounds[m][d].url;
        if (url && !url.startsWith('http') && !url.startsWith('/')) {
          // If it's a date-like background, it might be in daily/
          if (url.includes('-')) {
            url = '/background/daily/' + url;
          } else {
            url = '/background/' + url;
          }
          db.data.backgrounds[m][d].url = url;
        }
      }
    }
  }

  await db.write();
  console.log('Paths updated successfully.');
}

updatePaths();
