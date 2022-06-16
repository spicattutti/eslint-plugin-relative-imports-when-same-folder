import checkIfString from './checkIfString';

export default function replaceLastOccurrenceInString({
	input,
	find,
	replaceWith,
}) {
	if (![input, find, replaceWith].every(checkIfString)) {
		// returns input on invalid arguments
		return input;
	}

	const lastIndex = input.lastIndexOf(find);
	if (lastIndex < 0) {
		return input;
	}

	return (
		input.substring(0, lastIndex) +
		replaceWith +
		input.substring(lastIndex + find.length)
	);
}
