export default function checkIfRelativePath(path) {
	return path.length > 2 && path.startsWith('./');
}
