import { VoteType } from './constants'

export function getToken(address: string | undefined): string | undefined {
	if (!address) {
		return
	}
	const token = getItem('token', address)
	if (!token) {
		return
	}
	return token
}

export function setToken(address: string | undefined, token: string) {
	if (!address) {
		return
	}
	setItem('token', address, token)
}

export function getCommentVoteType(address: string, commentId: string) {
	return getItem('comment:vote', `${address}:${commentId}`) as VoteType | undefined
}

export function setCommentVoteType(address: string, commentId: string, voteType: VoteType) {
	setItem('comment:vote', `${address}:${commentId}`, voteType)
}

export function getThreadVoteType(address: string, threadId: string) {
	return getItem('thread:vote', `${address}:${threadId}`) as VoteType | undefined
}

export function setThreadVoteType(address: string, threadId: string, voteType: VoteType) {
	setItem('thread:vote', `${address}:${threadId}`, voteType)
}

function getItem(namespace: string, key: string) {
	return window.localStorage.getItem(`daochan:${namespace}:${key}`)
}

function setItem(namespace: string, key: string, value: string) {
	window.localStorage.setItem(`daochan:${namespace}:${key}`, value)
	window.dispatchEvent(new Event('storage')) // trigger storage event
}
