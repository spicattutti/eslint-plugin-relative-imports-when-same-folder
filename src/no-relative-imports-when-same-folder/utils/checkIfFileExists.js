import fs from 'fs';

export default function checkIfFileExists(path) {
	return fs.existsSync(path);
}
