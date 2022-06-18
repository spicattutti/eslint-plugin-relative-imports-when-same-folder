import resolveImportPathsBasedOnTsConfig from './resolveImportPathsBasedOnTsConfig';

describe('resolveImportPathBasedOnTsConfig', () => {
	test('tsConfig only states `baseUrl`', () => {
		const tsConfig = {
			compilerOptions: {
				baseUrl: './src',
			},
		};

		const possiblePaths = resolveImportPathsBasedOnTsConfig({
			tsConfig,
			importPath: 'components/foo',
		});
		expect(possiblePaths[0]).toBe('src/components/foo');
	});

	describe('when tsConfig also states paths', () => {
		const tsConfig = {
			compilerOptions: {
				baseUrl: '.',
				paths: {
					// aliases mapped to a single path
					'@library': ['src/library/src/index.js'],
					'@library/*': ['src/library/src/*'],
					// aliases mapped to multiplePaths path
					'~/*': ['client/src', 'server/src'],
				},
			},
		};

		it('handles paths do not contain a an alias', () => {
			const possiblePaths = resolveImportPathsBasedOnTsConfig({
				tsConfig,
				importPath: 'ghibberish',
			});
			expect(possiblePaths).toEqual(['ghibberish']);
		});

		it('handles aliases that do not state a wildcard', () => {
			const possiblePaths = resolveImportPathsBasedOnTsConfig({
				tsConfig,
				importPath: '@library',
			});
			expect(possiblePaths).toEqual(['src/library/src/index.js']);
		});

		it('handles aliases that state a wildcard', () => {
			const possiblePaths = resolveImportPathsBasedOnTsConfig({
				tsConfig,
				importPath: '@library/foo',
			});
			expect(possiblePaths).toEqual(['src/library/src/foo']);
		});

		it('handles multiple paths assigned to an alias', () => {
			const possiblePaths = resolveImportPathsBasedOnTsConfig({
				tsConfig,
				importPath: '~/utils',
			});
			expect(possiblePaths).toEqual(['client/src/utils', 'server/src/utils']);
		});

		it('handles aliases that state a wildcard independent on the order of object entries', () => {
			const tsConfigWithShuffledPathsOrder = {
				compilerOptions: {
					baseUrl: '.',
					paths: {
						'@library/*': ['src/library/src/*'],
						'@library': ['src/library/src/index.js'],
					},
				},
			};
			const possiblePaths = resolveImportPathsBasedOnTsConfig({
				tsConfig: tsConfigWithShuffledPathsOrder,
				importPath: '@library/foo',
			});
			expect(possiblePaths[0]).toBe('src/library/src/foo');
		});
	});
});
