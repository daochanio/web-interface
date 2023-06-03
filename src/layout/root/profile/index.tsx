import ConnectionButton, { useConnectionStore } from './ConnectionButton'
import ProfileButton from './ProfileButton'
import useAuth from '../../../hooks/useAuth'

// Show profile display only if connect and finished signup
export default function Profile() {
	const { isAuthenticated, user } = useAuth()
	const { isOpen } = useConnectionStore()

	if (isAuthenticated && user && !isOpen) {
		return <ProfileButton user={user} />
	}

	return <ConnectionButton />
}
