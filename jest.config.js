module.exports = {
	clearMocks: true,
	transform: {
		'\\.[jt]sx?$': 'babel-jest',
	},
	setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
};
