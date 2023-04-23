import { Component } from 'react'
import Unexpected from '../../layout/unexpected'

type Props = { children: React.ReactNode }

type State = { hasError: boolean }

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError() {
		return { hasError: true }
	}

	componentDidCatch() {
		return
	}

	render() {
		const { children } = this.props
		if (!this.state.hasError) {
			return children
		}

		return <Unexpected />
	}
}

export default ErrorBoundary
