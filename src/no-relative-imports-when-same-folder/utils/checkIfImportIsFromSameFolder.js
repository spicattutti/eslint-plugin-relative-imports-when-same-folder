import pathModule from 'path';

export default function checkIfImportIsFromSameFolder({ from, to }) {
	const relativePath = pathModule.relative(from, to);

	const isFromAndToEqual = !relativePath.length;
	if (isFromAndToEqual) {
		return true;
	}

	return !relativePath.startsWith('..');
}
