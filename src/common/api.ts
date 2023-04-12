import { Signer, FetchSignerResult } from '@wagmi/core'

export type Thread = {
	id: string
	address: string
	content: string
	isDeleted: boolean
	createdAt: string
	updatedAt: string
	votes: number
}

export type CreateThreadResponse = {
	id: string
}

export async function getThreads(offset: number, limit: number) {
	return api<Thread[]>('/threads', {
		method: 'GET',
		queryParams: [
			{ key: 'offset', value: offset },
			{ key: 'limit', value: limit },
		],
	})
}

export async function createThread({
	content,
	signer,
}: {
	content: string
	signer?: FetchSignerResult<Signer>
}): Promise<CreateThreadResponse> {
	return api<CreateThreadResponse>('/threads', { method: 'POST', body: { content }, signer })
}

type QueryParam = { key: string; value: string | number }

async function api<T>(
	resource: string,
	{
		method,
		body,
		queryParams,
		signer,
	}: { method: string; body?: unknown; queryParams?: QueryParam[]; signer?: FetchSignerResult<Signer> }
): Promise<T> {
	const options: RequestInit = {
		method,
	}
	if (body) {
		options.body = JSON.stringify(body)
	}
	if (signer) {
		const { signature, address } = await signMessage({ signer })
		options.headers = {
			Authorization: `Bearer ${signature}`,
			'X-Address': address,
		}
	}

	const query = queryParams ? `?${queryParams.map(({ key, value }) => `${key}=${value}`).join('&')}` : ''

	const url = `${import.meta.env.VITE_DAOCHAN_API_BASE_URL}${resource}${query}`

	const response = await fetch(url, options)

	if (response.status < 200 || response.status >= 400) {
		throw new Error(`Failed to fetch ${resource} ${response.status}`)
	}

	const textBody = await response.text()

	if (textBody) {
		return JSON.parse(textBody)
	}

	return {} as T
}

export async function signMessage({
	signer,
	noCache,
}: {
	signer: Signer
	noCache?: boolean
}): Promise<{ signature: string; address: string }> {
	const address = await signer.getAddress()
	const storageSignature = window.localStorage.getItem(`daochan_signature_${address}`)
	const storageSignatureExpirey = window.localStorage.getItem(`daochan_signature_expirey_${address}`)

	if (
		!noCache &&
		storageSignature &&
		storageSignatureExpirey &&
		Number.parseInt(storageSignatureExpirey) > Date.now() / 1000
	) {
		return { signature: storageSignature, address }
	}

	const response = await fetch(`${import.meta.env.VITE_DAOCHAN_API_BASE_URL}/challenge`, {
		method: 'PUT',
		body: JSON.stringify({ address }),
	})

	if (response.status !== 200) {
		throw new Error(`Failed to get challenge ${response.status}`)
	}

	const { message, expires } = await response.json()

	const signature = await signer.signMessage(message)

	window.localStorage.setItem(`daochan_signature_${address}`, signature)
	window.localStorage.setItem(`daochan_signature_expirey_${address}`, expires.toString())

	return { signature, address }
}
