import pathModule from 'path';
import { groupBy } from 'ramda';

/**
 * Inspects a [tsconfig`s module resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
 * configuration in order to make an absolute import path (that relies on either `baseUrl` and -- additionally -- `paths`) an absolute path starting from the cwd of tsConfig.compilerOptions.
 * Since one alias can be mapped to multiple paths, a list of reverse-mapped paths is returned.
 * See unit tests for an example/
 * @param tsConfig A parsed tsConfig.compilerOptions.json. See https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
 * @param importPath Some absolute import path, e.g. `jQuery`, `src/foo` or `foo`.
 * @returns {string[]} The list of paths.
 */
export default function resolveImportPathsBasedOnTsConfig({
	tsConfig,
	importPath,
}) {
	const pathMappings = tsConfig.compilerOptions.paths;

	if (!pathMappings) {
		// only baseUrl (e.g. `.` or `./src` is stated)
		if (
			!tsConfig.compilerOptions.baseUrl.length || // TODO: check if that is possible
			tsConfig.compilerOptions.baseUrl === '.'
		) {
			return importPath;
		}
		if (tsConfig.compilerOptions.baseUrl.startsWith('./')) {
			const baseUrlAsAbsolute = tsConfig.compilerOptions.baseUrl.replace(
				'./',
				''
			); // ./src -> src
			return [pathModule.join(baseUrlAsAbsolute, importPath)];
		}
	}

	// Reminder: TS can resolve one alias to multiple paths

	// First, try to find matches using aliases that do not use a wildcard in the given import path.
	// If we have two mappings
	// ~ -> src/index.js
	// ~/* src/components/*
	// and we have a given import path ~/foo.js, we want it to be resolved using the wildcard alias.

	const possiblePaths = [];

	const { pathMappingsWithWildCard = [], pathMappingsWithoutWildCard = [] } =
		groupPathMappingsByWildCardUsage(pathMappings);

	pathMappingsWithoutWildCard.forEach(([currentAlias, currentMappedPaths]) => {
		if (importPath === currentAlias) {
			// first match found, take it
			const sanitizedPaths = currentMappedPaths.map((p) =>
				importPath.replace(currentAlias, p)
			);
			possiblePaths.push(...sanitizedPaths);
		}
	});

	// TODO: make this smarter

	if (possiblePaths.length) {
		return possiblePaths;
	}

	pathMappingsWithWildCard.forEach(([currentAlias, currentMappedPaths]) => {
		currentMappedPaths.forEach((currentMappedPath) => {
			const aliasSplitAtWildCard = currentAlias.split('/*'); // '@library/*' -> ['@library/', '*']
			const [aliasRoot] = aliasSplitAtWildCard; // '@library/'

			const mappedPathSplitAtWildCard = currentMappedPath.split('*'); // 'src/library/*' -> ['src/library/', '*']
			const [mappedPathRoot] = mappedPathSplitAtWildCard; // src/library/

			if (importPath.includes(aliasRoot)) {
				const sanitizedPath = pathModule.join(
					importPath.replace(aliasRoot, mappedPathRoot)
				);
				possiblePaths.push(sanitizedPath);
			}
		});
	});

	if (possiblePaths.length) {
		return possiblePaths;
	}

	// import is not aliased, return as is

	return [importPath];
}

function checkIfUsesWildCard(path) {
	return path.includes('*');
}

function groupPathMappingsByWildCardUsage(paths) {
	const groupByHasWildCards = groupBy((pathMapping) => {
		const [alias] = pathMapping;
		return checkIfUsesWildCard(alias);
	});
	const pathMappingsGroupedByWildcardUsage = groupByHasWildCards(
		Object.entries(paths)
	);

	const pathMappingsWithWildCard = pathMappingsGroupedByWildcardUsage.true;
	const pathMappingsWithoutWildCard = pathMappingsGroupedByWildcardUsage.false;

	return { pathMappingsWithWildCard, pathMappingsWithoutWildCard };
}
