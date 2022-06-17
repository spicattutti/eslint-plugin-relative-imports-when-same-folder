import fs from 'fs';
import path from 'path';

function findDirWithFile(filename) {
	// start at our CWD and traverse upwards until we either hit the root "/" or find a directory with our file
	let dir = path.resolve(filename);
	do {
		dir = path.dirname(dir);
	} while (!fs.existsSync(path.join(dir, filename)) && dir !== '/');

	if (!fs.existsSync(path.join(dir, filename))) {
		return undefined;
	}

	return dir;
}

export default function getTsConfig() {
	const baseDir = findDirWithFile('package.json');
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
