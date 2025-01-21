import pathModule from 'path';

import checkIfRelativePath from './utils/checkIfRelativePath';
import getTsConfig from './utils/tsConfig/getTsConfig';
import checkIfTsConfigAdaptsModuleResolution from './utils/tsConfig/checkIfTsConfigAdaptsModuleResolution';
import resolveImportPathsBasedOnTsConfig from './utils/tsConfig/resolveImportPathsBasedOnTsConfig';
import checkIfPathCanBeResolved from './utils/checkIfPathCanBeResolved';

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

	const tsConfig = getTsConfig(dirOfInspectedFile);

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
			const rawImportSource = node.source.value; // e.g. "@library/Foo/Bar/Baz/baz"

			if (checkIfRelativePath(rawImportSource)) {
				// no-op. We assume that some other plugin (e.g. https://www.npmjs.com/package/eslint-plugin-no-relative-import-paths)
				// ensures that relative import paths are valid.
				return;
			}

			// handle import aliases

			// Depending on path mapping config, an import might get resolved to more than one file.
			const sanitizedImportSources = resolveImportPathsBasedOnTsConfig({
				// e.g.["src/library/Foo/Bar/Baz/baz"]
				tsConfig,
				importPath: rawImportSource,
			});

			// Map to absolute imports to allow file lookups
			const absoluteImportSources = sanitizedImportSources.map(
				(source) => pathModule.join(linterCwd, source) // e.g.["/Users/spic/dev/some_repo/src/library/Foo/Bar/Baz/baz.ts"]
			);

			// If we have two sources, check if one of these exists. Take the first match.
			const existingAbsoluteImportSources =
				absoluteImportSources.length > 1
					? absoluteImportSources.filter((absoluteImportSource) =>
							checkIfPathCanBeResolved({
								fromDir: linterCwd,
								// pathModule.relative returned sth like Baz/baz.ts. Make it a proper relative import path preceded by a dot.
								toPath: `./${pathModule.relative(
									linterCwd,
									absoluteImportSource
								)}`,
							})
					  )
					: absoluteImportSources;

			if (!existingAbsoluteImportSources.length === 1) {
				return;
			}
			const [importSource] = existingAbsoluteImportSources;
			if (!importSource?.length) {
				return;
			}

			let relativePath = pathModule.normalize(
				pathModule.relative(dirOfInspectedFile, importSource)
			);

			const isImportFromParent = relativePath.startsWith('..');
			if (isImportFromParent) {
				return;
			}

			// pathModule.relative returned sth like Baz/baz.ts. Make it a proper relative import path preceded by a dot.
			relativePath = `./${relativePath}`;

			// finally, propose fix

			context.report({
				node,
				messageId: 'importCanBeRelative',
				data: {
					fixedImportPath: relativePath,
				},
				fix: (fixer) => {
					return fixer.replaceText(node.source, `"${relativePath}"`);
				},
			});
		},
	};
}

export default createRule;
