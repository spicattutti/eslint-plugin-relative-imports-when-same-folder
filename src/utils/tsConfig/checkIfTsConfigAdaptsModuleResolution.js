export default function checkIfTsConfigAdaptsModuleResolution(tsConfig) {
	return 'baseUrl' in tsConfig;
}
