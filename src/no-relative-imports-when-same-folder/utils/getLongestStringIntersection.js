import checkIfString from './checkIfString';

/**
 * Tries to find the largest part of one string (the needle) in another string (the haystack).
 * @param stringContainingNeedle A string containing a token that is attempted to be found in the haystack string.
 * @param haystackString In this string, the token is attempted to be found.
 * @returns The longest intersection
 */
export default function getLongestStringIntersection({
	stringContainingNeedle,
	haystackString,
}) {
	if (![haystackString, stringContainingNeedle].every(checkIfString)) {
		return '';
	}

	const needleCandidates = [];
	for (
		let startIdxOnStringContainingNeedle = 0;
		startIdxOnStringContainingNeedle < stringContainingNeedle.length;
		startIdxOnStringContainingNeedle++
	) {
		for (
			let endIdxOnStringContainingNeedle = startIdxOnStringContainingNeedle + 1;
			endIdxOnStringContainingNeedle < stringContainingNeedle.length;
			endIdxOnStringContainingNeedle++
		) {
			const substring = stringContainingNeedle.substring(
				startIdxOnStringContainingNeedle,
				endIdxOnStringContainingNeedle + 1
			);

			needleCandidates.push(substring); // TODO: use Set to prevent adding duplicate entries
		}
	}

	const filteredNeedleCandidates = needleCandidates.filter((possibleNeedle) =>
		haystackString.includes(possibleNeedle)
	);

	if (!filteredNeedleCandidates.length) {
		return '';
	}

	const needleCandidatesSortedDescendingByLength = [
		...filteredNeedleCandidates,
	].sort((a, b) => b.length - a.length);

	return needleCandidatesSortedDescendingByLength[0];
}
