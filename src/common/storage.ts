export function getItem(namespace: string, key: string) {
	return localStorage.getItem(`daochan.${namespace}.${key}`)
}

export function setItem(namespace: string, key: string, value: string) {
	localStorage.setItem(`daochan.${namespace}.${key}`, value)
}
