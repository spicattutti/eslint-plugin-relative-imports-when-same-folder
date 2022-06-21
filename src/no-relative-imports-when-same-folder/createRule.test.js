import createRule, { messageIds } from './createRule';
import getTsConfig from './utils/tsConfig/getTsConfig';
import checkIfPathCanBeResolved from './utils/checkIfPathCanBeResolved';

jest.mock('./utils/tsConfig/getTsConfig');

jest.mock('./utils/checkIfPathCanBeResolved', () => {
	const actual = jest.requireActual('./utils/checkIfPathCanBeResolved');

	return {
		...actual,
		__esModule: true,
		default: jest.fn(() => true),
	};
});

const defaultTsConfig = {
	compilerOptions: {
		baseUrl: '.',
		paths: {
			foo: 'bar',
		},
	},
};

const defaultContext = {
	getFilename: () => '/Users/spic/dev/some_repo/src/Foo/Bar/Bar.tsx',
	getCwd: () => '/Users/spic/dev/some_repo',
	report: jest.fn(),
};

const runRuleForPath = ({
	importPath,
	inspectedFilePath,
	tsConfig = defaultTsConfig,
}) => {
	getTsConfig.mockReturnValueOnce(tsConfig);

	const node = {
		source: {
			value: importPath,
		},
	};

	const context = {
		...defaultContext,
		getFilename: () => inspectedFilePath,
	};

	const rule = createRule(context);

	return rule.ImportDeclaration(node);
};

describe('createRule', () => {
	describe('if tsconfig cannot be found', () => {
		it('throws, since that setup is crucial', () => {
			const notFoundTsConfig = null;

			expect(() =>
				runRuleForPath({
					importPath: 'does-not-matter',
					inspectedFilePath: 'also-does-not-matter',
					tsConfig: notFoundTsConfig,
				})
			).toThrow();
		});
	});

	describe('if import path is relative', () => {
		it('does not report an error', () => {
			runRuleForPath({
				importPath: './foo',
				inspectedFilePath: 'does-not-matter',
			});
			expect(defaultContext.report).not.toHaveBeenCalled();
		});
	});

	describe('for absolute import paths', () => {
		const tsConfig = {
			compilerOptions: {
				baseUrl: '.',
				paths: {
					// aliases mapped to a single path
					'@library': ['src/library/index.js'],
					'@library/*': ['src/library/*'],
					// aliases mapped to multiplePaths path
					'~/*': ['src/client/src/*', 'src/common/src/*'],
				},
			},
		};

		describe('that imports using an alias not containing a wildcard', () => {
			it('resolves to the file the alias points to', () => {
				runRuleForPath({
					inspectedFilePath: '/Users/spic/dev/some_repo/src/index.js',
					importPath: '@library',
					tsConfig,
				});

				expect(defaultContext.report).toHaveBeenCalledWith({
					data: {
						fixedImportPath: './library/index.js',
					},
					fix: expect.any(Function),
					messageId: messageIds.importCanBeRelative,
					node: {
						source: {
							value: '@library',
						},
					},
				});
			});
		});

		describe('that imports from a sibling file', () => {
			it('reports an error', () => {
				runRuleForPath({
					inspectedFilePath:
						'/Users/spic/dev/some_repo/src/library/components/FormCheckbox/FormCheckbox.tsx',
					importPath: '@library/components/FormCheckbox/Form.scss',
					tsConfig,
				});

				expect(defaultContext.report).toHaveBeenCalledWith({
					data: {
						fixedImportPath: './Form.scss',
					},
					fix: expect.any(Function),
					messageId: messageIds.importCanBeRelative,
					node: {
						source: {
							value: '@library/components/FormCheckbox/Form.scss',
						},
					},
				});
			});
		});

		describe('that imports from an index file within the same folder', () => {
			it('reports an error', () => {
				runRuleForPath({
					inspectedFilePath:
						'/Users/spic/dev/some_repo/src/library/components/FormCheckbox/FormCheckbox.tsx',
					importPath: '@library/components/FormCheckbox',
					tsConfig,
				});

				expect(defaultContext.report).toHaveBeenCalledWith({
					data: {
						fixedImportPath: './',
					},
					fix: expect.any(Function),
					messageId: messageIds.importCanBeRelative,
					node: {
						source: {
							value: '@library/components/FormCheckbox',
						},
					},
				});
			});
		});

		describe('that imports from a sibling folder', () => {
			it('does not report an error', () => {
				runRuleForPath({
					inspectedFilePath:
						'/Users/spic/dev/some_repo/src/library/components/FormCheckbox/FormCheckbox.tsx',
					importPath: '@library/components/Form/Form.scss',
					tsConfig,
				});

				expect(defaultContext.report).not.toHaveBeenCalled();
			});
		});

		describe('that imports from a descendant folder', () => {
			it('reports the error', () => {
				runRuleForPath({
					inspectedFilePath:
						'/Users/spic/dev/some_repo/src/library/components/FormCheckbox/FormCheckbox.tsx',
					importPath: '@library/components/FormCheckbox/Icon/Icon.tsx',
					tsConfig,
				});

				expect(defaultContext.report).toHaveBeenCalledWith({
					data: {
						fixedImportPath: './Icon/Icon.tsx',
					},
					fix: expect.any(Function),
					messageId: messageIds.importCanBeRelative,
					node: {
						source: {
							value: '@library/components/FormCheckbox/Icon/Icon.tsx',
						},
					},
				});
			});
		});

		describe('that have an alias that maps two two different dirs', () => {
			it('reports the error', () => {
				checkIfPathCanBeResolved.mockImplementationOnce(() => {
					return true;
				});

				runRuleForPath({
					inspectedFilePath:
						'/Users/spic/dev/some_repo/src/client/src/components/FormCheckbox/FormCheckbox.tsx',
					importPath: '~/components/FormCheckbox/Icon/Icon.tsx',
					tsConfig,
				});

				expect(defaultContext.report).toHaveBeenCalledWith({
					data: {
						fixedImportPath: './Icon/Icon.tsx',
					},
					fix: expect.any(Function),
					messageId: messageIds.importCanBeRelative,
					node: {
						source: {
							value: '~/components/FormCheckbox/Icon/Icon.tsx',
						},
					},
				});

				// test for the other possible dir

				// simulate that the second path stated for the alias can be resolved to a file

				checkIfPathCanBeResolved
					.mockImplementationOnce(() => {
						return true;
					})
					.mockImplementationOnce(() => {
						return false;
					});

				runRuleForPath({
					inspectedFilePath:
						'/Users/spic/dev/some_repo/src/client/src/renderer.tsx',
					importPath: '~/config/globals',
					tsConfig,
				});

				// import goes to src/common/src/*
				expect(defaultContext.report).not.toHaveBeenCalledWith();
			});
		});
	});
});
