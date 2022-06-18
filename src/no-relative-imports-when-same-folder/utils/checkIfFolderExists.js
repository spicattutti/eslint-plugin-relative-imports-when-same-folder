import fs from 'fs';
import pathModule from 'path';

export default function checkIfFolderExists(path) {
	const parsedPath = pathModule.parse(path);
	let files;
	try {
		files = fs.readdirSync(parsedPath.dir);
	} catch {
		// dir does not exist. no op
	}

	if (!files) {
		return false;
	}

	return files.length >= 1;
}
