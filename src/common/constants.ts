export enum VoteType {
	Upvote = 'upvote',
	Downvote = 'downvote',
	Unvote = 'unvote',
}

export function getVoteValue(voteType: VoteType) {
	switch (voteType) {
		case VoteType.Upvote:
			return 1
		case VoteType.Downvote:
			return -1
		case VoteType.Unvote:
		default:
			return 0
	}
}
