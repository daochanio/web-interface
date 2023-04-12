import { useParams } from 'react-router-dom'

export default function Thread() {
	const { threadId } = useParams()

	return (
		<div>
			<h1>Thread {threadId}</h1>
		</div>
	)
}
