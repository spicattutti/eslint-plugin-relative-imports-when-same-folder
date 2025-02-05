// mitigate https://github.com/jestjs/jest/issues/5196
// eslint-disable-next-line jest/no-hooks,jest/require-top-level-describe
beforeEach(() => {
	// eslint-disable-next-line jest/no-standalone-expect
	expect.hasAssertions();
});
