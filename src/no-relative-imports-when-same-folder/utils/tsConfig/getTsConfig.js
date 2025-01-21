import fs from 'fs';
import path from 'path';

function findDirWithFile(startDir, filename) {
	const rootDir = path.resolve(filename);
	let dir = path.resolve(startDir);

	// Traverse upwards from startDir to rootDir
	do {
		if (fs.existsSync(path.join(dir, filename))) {
			return dir;
		}
		dir = path.dirname(dir);
	} while (dir !== rootDir);

	return undefined;
}

export default function getTsConfig(dirOfInspectedFile) {
	const baseDir = findDirWithFile(dirOfInspectedFile, 'package.json');
	if (!baseDir) {
		return undefined;
	}

	const fpath = path.join(baseDir, 'tsconfig.json');
	if (!fs.existsSync(fpath)) {
		return undefined;
	}
	const tsConfig = fs.readFileSync(fpath);

	const config = JSON.parse(tsConfig);

	return config;
}
