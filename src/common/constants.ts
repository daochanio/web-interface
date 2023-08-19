export enum VoteType {
	Upvote = 'upvote',
	Downvote = 'downvote',
	Unvote = 'unvote',
}

export function getVoteValue(voteType: VoteType | undefined) {
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

export const REPUTATION_DECIMALS = 18
