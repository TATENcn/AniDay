export function useUrlSync() {
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search)
    return {
      date: params.get('date'),
      char: params.get('char')
    }
  }

  const updateUrlParams = (date: string, charIndex?: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('date', date)
    if (charIndex !== null && charIndex !== undefined) {
      url.searchParams.set('char', charIndex.toString())
    }
    window.history.replaceState({}, '', url.toString())
  }

  const initFromUrl = () => {
    const { date, char } = getUrlParams()
    const result: { date: string | null, charIndex: number } = {
      date: null,
      charIndex: 0
    }

    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      result.date = date
    }
    if (char !== null && !isNaN(parseInt(char))) {
      result.charIndex = parseInt(char)
    }

    return result
  }

  return {
    getUrlParams,
    updateUrlParams,
    initFromUrl
  }
}
