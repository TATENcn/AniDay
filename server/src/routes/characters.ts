import Elysia, { t } from "elysia";
import { characterSchema } from "@/data/characters";
import { getByDate, getToday } from "@/handlers/get-character";

const characterResponseSchema = t.Object({
  count: t.Number({ minimum: 0 }),
  characters: t.Array(characterSchema),
});

const route = new Elysia()
  .get(
    "/today",
    () => {
      const characters = getToday();

      return {
        count: characters.length,
        characters: characters,
      };
    },
    { response: characterResponseSchema },
  )
  .get(
    "/:month/:day",
    ({ params }) => {
      const characters = getByDate(params.month, params.day);

      return {
        count: characters.length,
        characters: characters,
      };
    },
    {
      params: t.Object({
        month: t.Numeric({ maximum: 12, minimum: 1 }),
        day: t.Numeric({ maximum: 31, minimum: 1 }),
      }),
      response: characterResponseSchema,
    },
  );

export { route };
export type ICharacterResponse = typeof characterResponseSchema.static;
