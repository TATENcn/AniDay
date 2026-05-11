import { ref, computed } from 'vue'

export interface Character {
  name: string;
  avatar?: string;
  image_url?: string;
  quotes?: string[];
  color?: string;
  cv?: string;
  work?: string;
  tags?: string[];
  music?: string;
  bg?: string;
}

const DEFAULT_QUOTE = '生日快乐'

export function useCharacters() {
  const characters = ref<Character[]>([])
  const currentIndex = ref(0)

  const currentCharacter = computed(() => characters.value[currentIndex.value] || null)

  const currentQuotes = computed(() => {
    if (!currentCharacter.value) return [DEFAULT_QUOTE]
    const quotes = currentCharacter.value.quotes || []
    if (quotes.length === 0) return [DEFAULT_QUOTE]
    return quotes
  })

  const selectCharacter = (index: number) => {
    if (index >= 0 && index < characters.value.length) {
      currentIndex.value = index
    }
  }

  const setCharacters = (data: Character[]) => {
    characters.value = data
    currentIndex.value = 0
  }

  const handleAvatarError = (event: Event, char: Character) => {
    const target = event.target as HTMLImageElement
    target.src = 'https://via.placeholder.com/100?text=' + encodeURIComponent(char.name?.charAt(0) || '?')
  }

  return {
    characters,
    currentIndex,
    currentCharacter,
    currentQuotes,
    selectCharacter,
    setCharacters,
    handleAvatarError
  }
}
