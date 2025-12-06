import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import eden from "@/eden";

const queryTodayCharacters = async () => eden.api.characters.today.get();

const IndexPage = () => {
	const [currentIndex, setIndex] = useState<number>(0);
	const [textOpacity, setTextOpacity] = useState<number>(0);
	const [backgroundOpacity, setBackgroundOpacity] = useState<number>(1);
	const [isChanging, setIsChanging] = useState<boolean>(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: we will change the background opacity when the index changes
	useEffect(() => {
		setBackgroundOpacity(1);
		setTimeout(() => {
			setTextOpacity(1);
		}, 250);
	}, [currentIndex]);

	const setCurrent = (index: number) => {
		if (index === currentIndex || isChanging) return;
		setIsChanging(true);

		setBackgroundOpacity(0);
		setTextOpacity(0);
		setTimeout(() => {
			setBackgroundOpacity(1);
			setIndex(index);

			setTimeout(() => {
				setTextOpacity(1);
				setIsChanging(false);
			}, 500);
		}, 500);
	};

	const result = useQuery({
		queryKey: ["characters"],
		queryFn: queryTodayCharacters,
	});

	if (!result.isSuccess || !result.data.data) {
		return;
	}

	const { characters } = result.data.data;

	if (characters.length === 0) {
		return (
			<div className="h-screen w-screen bg-neutral-800 text-neutral-300 text-2xl flex items-center justify-center">
				No character found
			</div>
		);
	}

	// biome-ignore-start lint/style/noNonNullAssertion: 123
	return (
		<>
			{/* background */}
			<img
				src={characters[currentIndex]!.assets.background}
				alt={`${characters[currentIndex]!.name}'s background`}
				style={{ opacity: backgroundOpacity }}
				className="object-cover absolute h-screen -z-50 transition-opacity duration-1000 ease-in-out"
			/>

			{/* content */}
			<div className="flex flex-col h-screen relative text-white z-50 md:w-lg lg:w-xl xl:w-2xl 2xl:w-4xl mx-auto gap-4 p-4">
				<div className="mb-auto"></div>

				{/* character information */}
				<div className="my-auto transition-opacity duration-500 ease-in-out" style={{ opacity: textOpacity }}>
					{/* name/birthday */}
					<div className="flex items-end gap-2">
						<div className="font-bold text-4xl">{characters[currentIndex]!.name}</div>
						<div className="text-md flex gap-2 text-neutral-300">
							<span>{String(characters[currentIndex]!.birthday.month).padStart(2, "0")}</span>
							<span>/</span>
							<span>{String(characters[currentIndex]!.birthday.day).padStart(2, "0")}</span>
						</div>
					</div>

					{/* from */}
					<div className="text-md text-neutral-300">{characters[currentIndex]!.from}</div>
				</div>

				{/* choose character to view */}
				<div className="mt-auto flex gap-x-1">
					{characters.map((ch, index) => (
						<img
							key={`${ch.name}-avatar`}
							className="object-cover size-8 rounded-full"
							src={ch.assets.avatar}
							alt={`${ch.name}'s avatar`}
							onClick={() => setCurrent(index)}
							onKeyDown={() => setCurrent(index)}
						/>
					))}
				</div>
			</div>
		</>
	);
	// biome-ignore-end lint/style/noNonNullAssertion: 1
};

export default IndexPage;
