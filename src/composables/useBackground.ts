import { ref } from 'vue'

const DEFAULT_BG = '/background/49831005.png'

export function useBackground() {
  const dateBgUrl = ref('')

  const checkFileExists = async (url: string) => {
    try {
      const formattedUrl = url.startsWith('/') ? url : `/${url}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch(formattedUrl, {
        method: 'HEAD',
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) return false
      const contentType = response.headers.get('Content-Type')
      return contentType && contentType.startsWith('image/')
    } catch (e) {
      return false
    }
  }

  const getBackgroundStyle = (characterBg?: string) => {
    let url = DEFAULT_BG

    if (characterBg) {
      url = characterBg
    } else if (dateBgUrl.value) {
      url = dateBgUrl.value
    }

    const formattedUrl = url.startsWith('http') || url.startsWith('/') ? url : `/${url}`

    return {
      backgroundImage: `url('${formattedUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }

  const loadDateBackground = async (month: number, day: number) => {
    dateBgUrl.value = ''

    try {
      const bgRes = await fetch('/data/background.json')
      if (bgRes.ok) {
        const bgData = await bgRes.json()
        if (bgData[month] && bgData[month][day] && bgData[month][day].url) {
          dateBgUrl.value = bgData[month][day].url
          return
        }
      }
    } catch (e) {
      console.log('Failed to load background config')
    }

    const extensions = ['jpg', 'png', 'webp', 'jpeg']
    for (const ext of extensions) {
      const url = `/background/${month}-${day}.${ext}`
      if (await checkFileExists(url)) {
        dateBgUrl.value = url
        break
      }
    }
  }

  return {
    dateBgUrl,
    getBackgroundStyle,
    loadDateBackground
  }
}
