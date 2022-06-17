import replaceLastOccurrenceInString from './replaceLastOccurrenceInString';

describe('replaceLastOccurrenceInString', () => {
	describe('happy path', () => {
		test.each`
			input                    | find     | replaceWith | expectedResult
			${'foo/baz/bar'}         | ${'baz'} | ${'*'}      | ${'foo/*/bar'}
			${'foo/baz/bar/foo/baz'} | ${'foo'} | ${'*'}      | ${'foo/baz/bar/*/baz'}
		`(
			'replacing "$find" in "$input" with "$replaceWith" results in "$expectedResult"',
			({ input, find, replaceWith, expectedResult }) => {
				const actualResult = replaceLastOccurrenceInString({
					input,
					find,
					replaceWith,
				});
				expect(actualResult).toBe(expectedResult);
			}
		);
	});

	it('handles invalid input by returning the input as is', () => {
		const validInput = 'foo/bar';
		const validFind = 'bar';
		const validReplaceWith = '*';
		const invalidValues = [undefined, null, {}, 42];

		// corrupted input
		invalidValues.forEach((invalidValue) => {
			const actualResult = replaceLastOccurrenceInString({
				input: invalidValue,
				find: validFind,
				replaceWith: validReplaceWith,
			});
			expect(actualResult).toBe(invalidValue);
		});

		// corrupted find
		invalidValues.forEach((invalidValue) => {
			const actualResult = replaceLastOccurrenceInString({
				input: validInput,
				find: invalidValue,
				replaceWith: validReplaceWith,
			});
			expect(actualResult).toBe(validInput);
		});

		// corrupted replaceWith
		invalidValues.forEach((invalidValue) => {
			const actualResult = replaceLastOccurrenceInString({
				input: validInput,
				find: validFind,
				replaceWith: invalidValue,
			});
			expect(actualResult).toBe(validInput);
		});
	});
});
