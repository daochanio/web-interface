import { GetWalletClientResult } from '@wagmi/core'
import { VoteType } from './constants'
import { getToken, setToken } from './storage'

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

export type Token = {
	token: string
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
	walletClient,
	image,
}: {
	title: string
	content: string
	image: File
	walletClient?: GetWalletClientResult
}) {
	const {
		data: { fileName: imageFileName },
	} = await uploadImage({ image, walletClient })

	return api<Thread>('/threads', {
		method: 'POST',
		body: JSON.stringify({ title, content, imageFileName }),
		walletClient,
	})
}

export async function createComment({
	threadId,
	content,
	walletClient,
	image,
	repliedToCommentId,
}: {
	threadId: string
	content: string
	image: File
	repliedToCommentId?: string
	walletClient?: GetWalletClientResult
}) {
	const {
		data: { fileName: imageFileName },
	} = await uploadImage({ image, walletClient })

	return api<Comment>(`/threads/${threadId}/comments`, {
		method: 'POST',
		body: JSON.stringify({ threadId, content, imageFileName, repliedToCommentId }),
		walletClient,
	})
}

export async function uploadImage({ image, walletClient }: { image: File; walletClient?: GetWalletClientResult }) {
	const formData = new FormData()
	formData.append('image', image)

	return api<UploadImageResponse>('/images', {
		method: 'POST',
		body: formData,
		walletClient,
	})
}

export async function createThreadVote({
	threadId,
	voteType,
	walletClient,
}: {
	threadId: string
	voteType: VoteType
	walletClient?: GetWalletClientResult
}) {
	return api<Thread>(`/threads/${threadId}/votes/${voteType}`, {
		method: 'PUT',
		walletClient,
	})
}

export async function createCommentVote({
	threadId,
	commentId,
	voteType,
	walletClient,
}: {
	threadId: string
	commentId: string
	voteType: VoteType
	walletClient?: GetWalletClientResult
}) {
	return api<Comment>(`/threads/${threadId}/comments/${commentId}/votes/${voteType}`, {
		method: 'PUT',
		walletClient,
	})
}

type QueryParam = { key: string; value: string | number }

async function api<T>(
	resource: string,
	{
		method,
		body,
		queryParams,
		walletClient,
	}: { method: string; body?: BodyInit; queryParams?: QueryParam[]; walletClient?: GetWalletClientResult }
): Promise<APIResponse<T>> {
	const options: RequestInit = {
		method,
	}
	if (body) {
		options.body = body
	}
	if (walletClient) {
		const { token, address } = await signMessage({ walletClient })
		options.headers = {
			Authorization: `Bearer ${token}`,
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
	walletClient,
	noCache,
}: {
	walletClient: GetWalletClientResult
	noCache?: boolean
}): Promise<{ token: string; address: string; cached: boolean }> {
	if (!walletClient) {
		throw new Error('No wallet client')
	}

	const address = walletClient.account.address
	const cachedToken = getToken(address)

	if (!noCache && cachedToken) {
		return { token: cachedToken, address, cached: true }
	}

	let response = await fetch(`${import.meta.env.VITE_DAOCHAN_API_BASE_URL}/signin/${address}`, {
		method: 'GET',
	})

	if (response.status !== 200) {
		throw new Error(`Failed to get challenge ${response.status}`)
	}

	const {
		data: { message },
	}: APIResponse<Challenge> = await response.json()

	const signature = await walletClient.signMessage({ message })

	response = await fetch(`${import.meta.env.VITE_DAOCHAN_API_BASE_URL}/signin/${address}`, {
		method: 'POST',
		body: JSON.stringify({ signature }),
	})

	if (response.status !== 200) {
		throw new Error(`Failed to get challenge ${response.status}`)
	}

	const {
		data: { token },
	}: APIResponse<Token> = await response.json()

	setToken(address, token)

	return { token, address, cached: false }
}
