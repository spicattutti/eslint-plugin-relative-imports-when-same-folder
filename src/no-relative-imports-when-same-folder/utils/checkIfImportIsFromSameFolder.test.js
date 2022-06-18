import checkIfImportIsFromSameFolder from './checkIfImportIsFromSameFolder';

describe('checkIfImportIsFromSameFolder', () => {
	it.each`
		idx  | from                     | to                               | expectedResult
		${0} | ${'/src'}                | ${'/docs'}                       | ${false}
		${1} | ${'/src'}                | ${'/src'}                        | ${true}
		${2} | ${'/src'}                | ${'/src/docs'}                   | ${true}
		${3} | ${'/src/Foo/Bar'}        | ${'/src/Foo/Bar/Bar.js'}         | ${true}
		${4} | ${'/src/Foo/Baz'}        | ${'/src/Foo/Baz/Bumms/Bumms.js'} | ${true}
		${5} | ${'/src/Foo/Bar/Bar.js'} | ${'src/Foo'}                     | ${false}
	`('from $from to $to: $expectedResult', ({ from, to, expectedResult }) => {
		expect(checkIfImportIsFromSameFolder({ from, to })).toBe(expectedResult);
	});
});
