import { ref, watch } from 'vue'
import jsmediatags from 'jsmediatags'

const DEFAULT_MUSIC = '/music/02. 潮鳴り.flac'

export interface MusicMetadata {
  title: string;
  artist: string;
}

export function useMusic() {
  const currentMusic = ref(DEFAULT_MUSIC)
  const musicMetadata = ref<MusicMetadata>({ title: '', artist: '' })

  const fetchMusicMetadata = async (url: string) => {
    const fileName = url.split('/').pop()?.split('.')[0] || '未知曲目'
    musicMetadata.value = { title: fileName, artist: '加载中...' }

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Network response was not ok')
      const blob = await response.blob()
      const file = new File([blob], url.split('/').pop() || 'music', { type: blob.type })

      jsmediatags.read(file, {
        onSuccess: (tag) => {
          musicMetadata.value = {
            title: tag.tags.title || fileName,
            artist: tag.tags.artist || '未知艺术家'
          }
        },
        onError: function() {
          musicMetadata.value = {
            title: fileName,
            artist: ''
          }
        }
      })
    } catch (e) {
      musicMetadata.value = {
        title: fileName,
        artist: ''
      }
    }
  }

  const setMusic = (musicPath?: string) => {
    if (musicPath) {
      currentMusic.value = musicPath
    } else {
      currentMusic.value = DEFAULT_MUSIC
    }
  }

  watch(currentMusic, (newUrl) => {
    if (newUrl) fetchMusicMetadata(newUrl)
  }, { immediate: true })

  return {
    currentMusic,
    musicMetadata,
    setMusic,
    fetchMusicMetadata
  }
}
