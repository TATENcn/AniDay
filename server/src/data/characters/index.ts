import { t } from "elysia";
import januaryCharacters from "./january";

const characters = [...januaryCharacters];

const characterSchema = t.Object({
  name: t.String(),
  from: t.String(),
  birthday: t.Object({
    month: t.Number({ maximum: 12, minimum: 1 }),
    day: t.Number({ maximum: 31, minimum: 1 }),
  }),
  assets: t.Object({
    avatar: t.Optional(t.String()),
    avatarFrom: t.Optional(t.String()),
    background: t.Optional(t.String()),
    backgroundFrom: t.Optional(t.String()),
  }),
});

type ICharacter = typeof characterSchema.static;

export type { ICharacter };
export { characters, characterSchema };
