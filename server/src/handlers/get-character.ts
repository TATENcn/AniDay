import { characters, type ICharacter } from "@/data/characters";

const getByDate = (month: number, day: number): ICharacter[] =>
	characters.filter(({ birthday }) => birthday.day === day && birthday.month === month);

const getToday = (): ICharacter[] => {
	const date = new Date();
	const [month, day] = [date.getMonth() + 1, date.getDate()];

	return getByDate(month, day);
};

export { getByDate, getToday };
