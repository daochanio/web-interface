import { VoteType } from './constants'

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
