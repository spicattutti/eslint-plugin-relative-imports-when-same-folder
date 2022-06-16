export default function checkIfTsConfigAdaptsModuleResolution(tsConfig) {
	const { compilerOptions } = tsConfig;

	return 'baseUrl' in compilerOptions;
}
