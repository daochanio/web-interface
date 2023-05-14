import { VoteType } from './constants'

export function getSignature(address: string): string | undefined {
	const value = getItem('signature', address)
	if (!value) {
		return
	}
	const { signature, expires } = JSON.parse(value)
	if (expires < Date.now() / 1000) {
		return
	}
	return signature
}

export function setSignature(address: string, signature: string, expires: number) {
	setItem('signature', address, JSON.stringify({ signature, expires }))
}

export function clearSignature(address: string) {
	setItem('signature', address, '')
}

export function getCommentVoteType(address: string, commentId: string) {
	return getItem('comment:vote', `${address}.${commentId}`) as VoteType | undefined
}

export function setCommentVoteType(address: string, commentId: string, voteType: VoteType) {
	setItem('comment:vote', `${address}.${commentId}`, voteType)
}

export function getThreadVoteType(address: string, threadId: string) {
	return getItem('thread:vote', `${address}.${threadId}`) as VoteType | undefined
}

export function setThreadVoteType(address: string, threadId: string, voteType: VoteType) {
	setItem('thread:vote', `${address}.${threadId}`, voteType)
}

function getItem(namespace: string, key: string) {
	return localStorage.getItem(`daochan:${namespace}.${key}`)
}

function setItem(namespace: string, key: string, value: string) {
	localStorage.setItem(`daochan:${namespace}.${key}`, value)
}
