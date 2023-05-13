import { Signer, FetchSignerResult } from '@wagmi/core'
import { VoteType } from './constants'
import { getSignature, setSignature } from './storage'

export type Thread = {
	id: string
	address: string
	title: string
	content: string
	image?: Image
	comments?: Comment[]
	isDeleted: boolean
	createdAt: string
	updatedAt: string
	votes: number
}

export type Image = {
	fileName: string
	url: string
	contentType: string
}

export type Comment = {
	id: string
	address: string
	threadId: string
	content: string
	image?: Image
	repliedToComment?: Comment
	isDeleted: boolean
	createdAt: string
	updatedAt: string
	votes: number
}

export type Challenge = {
	message: string
	expires: number
}

export type UploadImageResponse = {
	fileName: string
	url: string
	contentType: string
}

export type Page = {
	offset: number
	limit: number
	count: number
}

export type APIResponse<T> = {
	data: T
	nextPage?: Page
}

export async function getThreadById({ id, offset, limit }: { id: string; offset: number; limit: number }) {
	return api<Thread>(`/threads/${id}?offset=${offset}&limit=${limit}`, {
		method: 'GET',
	})
}

export async function getCommentsByThreadId({
	threadId,
	offset,
	limit,
}: {
	threadId: string
	offset: number
	limit: number
}) {
	return api<Comment[]>(`/threads/${threadId}/comments?offset=${offset}&limit=${limit}`, {
		method: 'GET',
	})
}

export async function getThreads({ limit }: { limit: number }) {
	return api<Thread[]>(`/threads?limit=${limit}`, {
		method: 'GET',
	})
}

export async function createThread({
	title,
	content,
	signer,
	image,
}: {
	title: string
	content: string
	image: File
	signer?: FetchSignerResult<Signer>
}) {
	const {
		data: { fileName: imageFileName },
	} = await uploadImage({ image, signer })

	return api<Thread>('/threads', {
		method: 'POST',
		body: JSON.stringify({ title, content, imageFileName }),
		signer,
	})
}

export async function createComment({
	threadId,
	content,
	signer,
	image,
	repliedToCommentId,
}: {
	threadId: string
	content: string
	image: File
	repliedToCommentId?: string
	signer?: FetchSignerResult<Signer>
}) {
	const {
		data: { fileName: imageFileName },
	} = await uploadImage({ image, signer })

	return api<Comment>(`/threads/${threadId}/comments`, {
		method: 'POST',
		body: JSON.stringify({ threadId, content, imageFileName, repliedToCommentId }),
		signer,
	})
}

export async function uploadImage({ image, signer }: { image: File; signer?: FetchSignerResult<Signer> }) {
	const formData = new FormData()
	formData.append('image', image)

	return api<UploadImageResponse>('/images', {
		method: 'POST',
		body: formData,
		signer,
	})
}

export async function createThreadVote({
	threadId,
	voteType,
	signer,
}: {
	threadId: string
	voteType: VoteType
	signer?: FetchSignerResult<Signer>
}) {
	return api<Thread>(`/threads/${threadId}/votes/${voteType}`, {
		method: 'PUT',
		signer,
	})
}

export async function createCommentVote({
	threadId,
	commentId,
	voteType,
	signer,
}: {
	threadId: string
	commentId: string
	voteType: VoteType
	signer?: FetchSignerResult<Signer>
}) {
	return api<Comment>(`/threads/${threadId}/comments/${commentId}/votes/${voteType}`, {
		method: 'PUT',
		signer,
	})
}

type QueryParam = { key: string; value: string | number }

async function api<T>(
	resource: string,
	{
		method,
		body,
		queryParams,
		signer,
	}: { method: string; body?: BodyInit; queryParams?: QueryParam[]; signer?: FetchSignerResult<Signer> }
): Promise<APIResponse<T>> {
	const options: RequestInit = {
		method,
	}
	if (body) {
		options.body = body
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

	return {} as APIResponse<T>
}

export async function signMessage({
	signer,
	noCache,
}: {
	signer: Signer
	noCache?: boolean
}): Promise<{ signature: string; address: string }> {
	const address = await signer.getAddress()
	const signature = getSignature(address)

	if (!noCache && signature) {
		return { signature, address }
	}

	const response = await fetch(`${import.meta.env.VITE_DAOCHAN_API_BASE_URL}/signin`, {
		method: 'PUT',
		body: JSON.stringify({ address }),
	})

	if (response.status !== 200) {
		throw new Error(`Failed to get challenge ${response.status}`)
	}

	const {
		data: { message, expires },
	}: APIResponse<Challenge> = await response.json()

	const sig = await signer.signMessage(message)

	setSignature(address, sig, expires)

	return { signature: sig, address }
}
