import checkIfRelativePath from './utils/checkIfRelativePath';
import getLongestStringIntersection from './utils/getLongestStringIntersection';
import replaceLastOccurrenceInString from './utils/replaceLastOccurrenceInString';

const rule = {
	'eslint-plugin-relative-imports-when-same-folder': {
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
	return {
		ImportDeclaration(node) {
			const importSource = node.source.value; // sth like "foo/bar/baz.ts"
			const cwd = context.getCwd(); // sth like "/dev/some_repo/src/foo/bar"

			if (checkIfRelativePath(importSource)) {
				// no-op. We assume that some other plugin (e.g. https://www.npmjs.com/package/eslint-plugin-no-relative-import-paths)
				// ensures that relative import paths are valid.
				return;
			}

			// Finding the largest intersection between the import path and the CWD.

			const longestPartOfImportSourceFoundInCwd = getLongestStringIntersection({
				stringContainingNeedle: importSource,
				haystackString: cwd,
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
