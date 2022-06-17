import pathModule from 'path';

import checkIfString from './checkIfString';

/**
 * Returns the longest intersection between two paths that have the same start.
 * It assumes a path starts with a slash.
 * @param pathA E.g. /foo/bar
 * @param pathB E.g. /foo/bar/baz
 * @returns {string} E.g. /foo/bar
 */
export default function getLongestPathIntersection({ pathA, pathB }) {
	if (![pathA, pathB].every(checkIfString)) {
		return '';
	}

	if (pathA === pathB) {
		return pathA;
	}

	const pathASegments = pathA.split('/');
	const pathBSegments = pathB.split('/');

	const commonSegments = [];
	for (let idx = 0; idx < pathASegments.length; idx++) {
		const pathAElement = pathASegments[idx];
		const pathBElement = pathBSegments[idx];
		const isItemFoundInBothListsAtSamePosition = pathAElement === pathBElement;
		if (isItemFoundInBothListsAtSamePosition) {
			commonSegments.push(pathAElement);
		} else {
			break;
		}
	}

	return `/${pathModule.join(...commonSegments)}`;
}
