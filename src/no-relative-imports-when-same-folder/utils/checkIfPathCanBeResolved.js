const resolveModule = require('enhanced-resolve');

// TODO: document hardcoded list. If doable, add option to customize
const supportedExtensions = [
	'.js',
	'.ts',
	'.jsx',
	'.tsx',
	'.scss',
	'.css',
	'.svg',
	'.json',
];

const resolve = resolveModule.create.sync({
	extensions: supportedExtensions,
});

export default function checkIfPathCanBeResolved({ fromDir, toPath }) {
	let file;
	try {
		file = resolve(fromDir, toPath);
	} catch {
		// Not resolved. This isxpected, ust swallow the error.
	}

	return Boolean(file);
}
