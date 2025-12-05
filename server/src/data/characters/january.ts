import { characterDataUri as p } from "@/utils";
import type { ICharacter } from ".";

export default [
  {
    name: "四宫辉夜",
    birthday: { month: 1, day: 1 },
    from: "辉夜大小姐想让我告白",
    assets: {
      avatar: p("四宫辉夜", "avatar.png"),
      avatarFrom: "Official",
      background: p("四宫辉夜", "background.png"),
      backgroundFrom: "Unknown",
    },
  },
] satisfies ICharacter[];
