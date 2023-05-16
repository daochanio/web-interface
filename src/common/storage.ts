import { VoteType } from './constants'
import jwtDecode from 'jwt-decode'

type claims = {
	iss: string
	sub: string
	iat: number
	exp: number
}

export function getToken(address: string): string | undefined {
	const token = getItem('token', address)
	if (!token) {
		return
	}
	const claims = jwtDecode(token) as claims
	if (claims.exp < Date.now() / 1000) {
		return
	}
	return token
}

export function setToken(address: string, token: string) {
	setItem('token', address, token)
}

export function clearToken(address: string) {
	setItem('token', address, '')
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
	return localStorage.getItem(`daochan:${namespace}:${key}`)
}

function setItem(namespace: string, key: string, value: string) {
	localStorage.setItem(`daochan:${namespace}:${key}`, value)
}
