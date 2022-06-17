import getLongestPathIntersection from './getLongestPathIntersection';

describe('getLongestPathIntersection', () => {
	describe('happy path', () => {
		it.each`
			pathA               | pathB               | expectedResult
			${'/foo/baz/bar'}   | ${'/foo/baz/bar'}   | ${'/foo/baz/bar'}
			${'/foo/baz/bar'}   | ${'/foo/baz'}       | ${'/foo/baz'}
			${'/foo/baz'}       | ${'/foo/baz/bar'}   | ${'/foo/baz'}
			${'/foo/basalt'}    | ${'/foo/baz'}       | ${'/foo'}
			${'/foo/basalt'}    | ${'/foo/baz'}       | ${'/foo'}
			${'/foo/bar/bumms'} | ${'/foo/baz/bumms'} | ${'/foo'}
		`(
			'determines the overlap of $pathA and $pathB to be $expectedResult',
			({ pathA, pathB, expectedResult }) => {
				const actualResult = getLongestPathIntersection({
					pathA,
					pathB,
				});
				expect(actualResult).toBe(expectedResult);
			}
		);
	});

	it('handles invalid input', () => {
		const validInput = 'foo';
		const invalidInputs = [undefined, null, {}, 42];

		// corrupted pathA
		invalidInputs.forEach((invalidInput) => {
			expect(
				getLongestPathIntersection({
					pathA: invalidInput,
					pathB: validInput,
				})
			).toBe('');
		});

		// corrupted pathB
		invalidInputs.forEach((invalidInput) => {
			expect(
				getLongestPathIntersection({
					pathA: validInput,
					pathB: invalidInput,
				})
			).toBe('');
		});

		// both corrupted
		invalidInputs.forEach((invalidInput) => {
			expect(
				getLongestPathIntersection({
					pathA: invalidInput,
					pathB: invalidInput,
				})
			).toBe('');
		});
	});
});
