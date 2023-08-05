import { GetWalletClientResult } from '@wagmi/core'
import { VoteType } from './constants'

export type Thread = {
	id: string
	user: User
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
	originalUrl: string
	thumbnailUrl: string
}

export type Comment = {
	id: string
	user: User
	threadId: string
	content: string
	image?: Image
	repliedToComment?: Comment
	isDeleted: boolean
	createdAt: string
	updatedAt: string
	votes: number
}

export type User = {
	address: string
	ensName?: string
	ensAvatar?: Avatar
	reputation: string
	createAt: string
	updatedAt?: string
}

export type Avatar = {
	fileName: string
	url: string
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

export async function getUserByAddress({ address }: { address: string }) {
	return api<User>(`/users/${address}`, {
		method: 'GET',
	})
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
	token,
	image,
}: {
	title: string
	content: string
	image: File
	token?: string
}) {
	const {
		data: { fileName: imageFileName },
	} = await uploadImage({ image, token })

	return api<Thread>('/threads', {
		method: 'POST',
		body: JSON.stringify({ title, content, imageFileName }),
		token,
	})
}

export async function createComment({
	threadId,
	content,
	token,
	image,
	repliedToCommentId,
}: {
	threadId: string
	content: string
	image: File
	repliedToCommentId?: string
	token?: string
}) {
	const {
		data: { fileName: imageFileName },
	} = await uploadImage({ image, token })

	return api<Comment>(`/threads/${threadId}/comments`, {
		method: 'POST',
		body: JSON.stringify({ threadId, content, imageFileName, repliedToCommentId }),
		token,
	})
}

export async function uploadImage({ image, token }: { image: File; token?: string }) {
	const formData = new FormData()
	formData.append('image', image)

	return api<UploadImageResponse>('/images', {
		method: 'POST',
		body: formData,
		token,
	})
}

export async function createThreadVote({
	threadId,
	voteType,
	token,
}: {
	threadId: string
	voteType: VoteType
	token?: string
}) {
	return api<Thread>(`/threads/${threadId}/votes/${voteType}`, {
		method: 'PUT',
		token,
	})
}

export async function createCommentVote({
	threadId,
	commentId,
	voteType,
	token,
}: {
	threadId: string
	commentId: string
	voteType: VoteType
	token?: string
}) {
	return api<Comment>(`/threads/${threadId}/comments/${commentId}/votes/${voteType}`, {
		method: 'PUT',
		token,
	})
}

type QueryParam = { key: string; value: string | number }

async function api<T>(
	resource: string,
	{ method, body, queryParams, token }: { method: string; body?: BodyInit; queryParams?: QueryParam[]; token?: string }
): Promise<APIResponse<T>> {
	const options: RequestInit = {
		method,
	}
	if (body) {
		options.body = body
	}
	if (token) {
		options.headers = {
			Authorization: `Bearer ${token}`,
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

export async function signin({ walletClient }: { walletClient: GetWalletClientResult }) {
	if (!walletClient) {
		throw new Error('No wallet client')
	}

	const address = walletClient.account.address

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

	return { token, address }
}
