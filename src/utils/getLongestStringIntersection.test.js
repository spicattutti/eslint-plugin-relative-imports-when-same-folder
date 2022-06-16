import getLongestStringIntersection from './getLongestStringIntersection';

describe('getLongestStringIntersection', () => {
	describe('happy path', () => {
		test.each`
			testSummary               | haystackString           | stringContainingNeedle | expectedResult
			${'needle at end'}        | ${'foo/baz/bar'}         | ${'baz/bar'}           | ${'baz/bar'}
			${'needle not at end'}    | ${'foo/baz/bar'}         | ${'baz/bar/bumms'}     | ${'baz/bar'}
			${'multiple occurrences'} | ${'foo/baz/bar/foo/baz'} | ${'bumms/foo/baz'}     | ${'/foo/baz'}
		`(
			'$testSummary',
			({ haystackString, stringContainingNeedle, expectedResult }) => {
				const actualResult = getLongestStringIntersection({
					haystackString,
					stringContainingNeedle,
				});
				expect(actualResult).toBe(expectedResult);
			}
		);
	});

	it('handles invalid input', () => {
		const validInput = 'foo';
		const invalidInputs = [undefined, null, {}, 42];

		// corrupted needle
		invalidInputs.forEach((invalidInput) => {
			expect(
				getLongestStringIntersection({
					haystackString: validInput,
					stringContainingNeedle: invalidInput,
				})
			).toEqual('');
		});

		// corrupted haystack
		invalidInputs.forEach((invalidInput) => {
			expect(
				getLongestStringIntersection({
					haystackString: invalidInput,
					stringContainingNeedle: validInput,
				})
			).toEqual('');
		});

		// corrupted both
		invalidInputs.forEach((invalidInput) => {
			expect(
				getLongestStringIntersection({
					haystackString: invalidInput,
					stringContainingNeedle: invalidInput,
				})
			).toEqual('');
		});
	});
});
