/**
 * shorten and normalize a long address
 */
export default function useDisplayAddress(str: string | undefined) {
	if (!str) {
		return ''
	}

	const substr = str.includes('0x') ? str.split('0x')[1] : str

	if (substr.length < 6) {
		return substr
	}

	return substr.substring(0, 6)
}
