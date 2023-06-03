import ConnectionButton from './ConnectionButton'
import ProfileButton from './ProfileButton'
import useAuth from '../../../hooks/useAuth'

// Show profile display only if connect and finished signup
export default function Profile() {
	const { isAuthenticated, user } = useAuth()

	if (isAuthenticated && user) {
		return <ProfileButton user={user} />
	}

	return <ConnectionButton />
}
