import checkIfRelativePath from './utils/checkIfRelativePath';
import getLongestStringIntersection from './utils/getLongestStringIntersection';
import replaceLastOccurrenceInString from './utils/replaceLastOccurrenceInString';
import getTsConfig from './utils/tsConfig/getTsConfig';
import checkIfTsConfigAdaptsModuleResolution from './utils/tsConfig/checkIfTsConfigAdaptsModuleResolution';
import resolveImportPathsBasedOnTsConfig from './utils/tsConfig/resolveImportPathsBasedOnTsConfig';

const RULE_NAME = 'no-relative-imports-when-same-folder';
const ERROR_INFO = `${RULE_NAME} relies on absolute import paths being setup in tsconfig. Pls check the plugin docs.`;

const rule = {
	[RULE_NAME]: {
		meta: {
			type: 'layout',
			fixable: 'code',
			hasSuggestions: true,
		},
		create,
		messages: {
			importCanBeRelative:
				'Import path can be relative since a file is imported from within the same folder \n \n' +
				'Replace with {{fixedImportPath}}',
		},
	},
};

// See https://eslint.org/docs/developer-guide/working-with-rules#the-context-object

function create(context) {
	const cwd = context.getCwd(); // sth like "/dev/some_repo/src/foo/bar"

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
		ImportDeclaration(node) {
			const importSource = node.source.value; // sth like "foo/bar/baz.ts"

			if (checkIfRelativePath(importSource)) {
				// no-op. We assume that some other plugin (e.g. https://www.npmjs.com/package/eslint-plugin-no-relative-import-paths)
				// ensures that relative import paths are valid.
				return;
			}

			// handle import aliases

			// depending on path mapping config, an import might get resolved to more than one file.
			// Try to find the largest intersection between the import path and the CWD *for all possible import paths*
			let longestPartOfImportSourceFoundInCwd = '';

			const sanitizedImportSources = resolveImportPathsBasedOnTsConfig({
				tsConfig,
				importPath: importSource,
			});

			sanitizedImportSources.forEach((possibleSource) => {
				const currentLongestIntersection = getLongestStringIntersection({
					stringContainingNeedle: possibleSource,
					haystackString: cwd,
				});

				if (currentLongestIntersection > longestPartOfImportSourceFoundInCwd) {
					longestPartOfImportSourceFoundInCwd = currentLongestIntersection;
				}
			});

			if (!longestPartOfImportSourceFoundInCwd.length) {
				return;
			}

			// try to replace cwd in importSource with a dot to make the path relative.
			// If the result is a valid relative URL, use it to fix

			const sourceWithOverlapReplacedWithDot = replaceLastOccurrenceInString({
				input: importSource,
				find: longestPartOfImportSourceFoundInCwd,
				replaceWith: '.',
			});

			if (!checkIfRelativePath(sourceWithOverlapReplacedWithDot)) {
				return;
			}

			// finally, propose fix

			context.report({
				node,
				messageId: 'importCanBeRelative',
				data: 'sourceWithOverlapReplacedWithDot',
				fix: (fixer) => {
					return fixer.replaceText(
						node.source,
						sourceWithOverlapReplacedWithDot
					);
				},
			});
		},
	};
}

export default rule;
