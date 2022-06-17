import pathModule from 'path';

import checkIfRelativePath from './utils/checkIfRelativePath';
import getLongestPathIntersection from './utils/getLongestPathIntersection';
import replaceLastOccurrenceInString from './utils/replaceLastOccurrenceInString';
import getTsConfig from './utils/tsConfig/getTsConfig';
import checkIfTsConfigAdaptsModuleResolution from './utils/tsConfig/checkIfTsConfigAdaptsModuleResolution';
import resolveImportPathsBasedOnTsConfig from './utils/tsConfig/resolveImportPathsBasedOnTsConfig';

export const messageIds = {
	importCanBeRelative: 'importCanBeRelative',
};

const ERROR_INFO =
	'This rule relies on absolute import paths being setup in tsconfig. Pls check the plugin docs.';

/**
 * A function meant to be passed to as `create` option to the eslint rule.
 * Throws if no tsconfig.json can be found.
 * @param context See https://eslint.org/docs/developer-guide/working-with-rules#the-context-object
 * @returns {{ImportDeclaration(*): void}}
 */
function createRule(context) {
	const filename = context.getFilename(); // sth like "/Users/spic/dev/some_repo/src/library/Foo/Bar/Bar.tsx"
	const linterCwd = context.getCwd(); // cwd passed to `Linter`, see https://eslint.org/docs/developer-guide/nodejs-api#linter
	const dirOfInspectedFile = pathModule.dirname(filename); //  "/Users/spic/dev/some_repo/src/library/Foo/Bar"

	const tsConfig = getTsConfig();

	if (!tsConfig) {
		throw new Error(`No tsconfig found. \n\n${ERROR_INFO}\n\n`);
	}

	if (!checkIfTsConfigAdaptsModuleResolution(tsConfig)) {
		throw new Error(
			`No module resolution setup found in tsConfig.json.\n\n${ERROR_INFO} \n\n`
		);
	}

	return {
		// AST element to provide the import path
		ImportDeclaration(node) {
			const importSource = node.source.value; // e.g. "@library/Foo/Bar/Baz/baz.ts"

			if (checkIfRelativePath(importSource)) {
				// no-op. We assume that some other plugin (e.g. https://www.npmjs.com/package/eslint-plugin-no-relative-import-paths)
				// ensures that relative import paths are valid.
				return;
			}

			// handle import aliases

			// Depending on path mapping config, an import might get resolved to more than one file.
			// If there are multiple possible import paths, only is one is expected to
			// be a candidate for a relative import
			// Try to find the largest intersection between the import path and the CWD *for all possible import paths* and save that intersection string as well as the path.
			let longestPartOfImportSourceFoundInCwd = '';
			let pathCandidate = '';

			const sanitizedImportSources = resolveImportPathsBasedOnTsConfig({
				// e.g.["src/library/Foo/Bar/Baz/baz.ts"]
				tsConfig,
				importPath: importSource,
			});

			sanitizedImportSources.forEach((possibleSanitizedImportSource) => {
				const possibleSanitizedImportSourceAsFullDiskPath = pathModule.join(
					linterCwd,
					possibleSanitizedImportSource
				); // e.g.["/Users/spic/dev/some_repo/src/library/Foo/Bar/Baz/baz.ts"]

				const currentLongestIntersection = getLongestPathIntersection({
					pathA: possibleSanitizedImportSourceAsFullDiskPath,
					pathB: dirOfInspectedFile,
				});

				const currentLongestIntersectionFromLinterCwdOn =
					currentLongestIntersection.replace(linterCwd, '');

				if (currentLongestIntersection > longestPartOfImportSourceFoundInCwd) {
					longestPartOfImportSourceFoundInCwd =
						currentLongestIntersectionFromLinterCwdOn;
					pathCandidate = possibleSanitizedImportSource;
				}
			});

			if (!longestPartOfImportSourceFoundInCwd.length) {
				return;
			}

			// try to make import path relative based on the found overlap.
			// If the result is a valid relative URL, use it to fix

			const sourceWithOverlapReplacedWithDot = replaceLastOccurrenceInString({
				input: `/${pathCandidate}`, // does not start with a slash, so
				find: longestPartOfImportSourceFoundInCwd, // starts with a slash
				replaceWith: '.',
			});

			if (!checkIfRelativePath(sourceWithOverlapReplacedWithDot)) {
				return;
			}

			// finally, propose fix

			context.report({
				node,
				messageId: 'importCanBeRelative',
				data: {
					fixedImportPath: sourceWithOverlapReplacedWithDot,
				},
				fix: (fixer) => {
					return fixer.replaceText(
						node.source,
						`"${sourceWithOverlapReplacedWithDot}"`
					);
				},
			});
		},
	};
}

export default createRule;
