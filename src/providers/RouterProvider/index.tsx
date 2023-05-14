import { ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Box, Container } from '@chakra-ui/react'
import { Routes } from '../../common/routes'
import Root from '../../layout/root'
import Home from '../../layout/home'
import ErrorBoundary from './ErrorBoundary'
import About from '../../layout/about'
import Trending from '../../layout/trending'
import Thread from '../../layout/thread'
import NotFound from '../../layout/notFound'
import { BackButton } from './BackButton'

const router = createBrowserRouter([
	{
		path: Routes.HOME,
		element: (
			<ErrorBoundary>
				<Root />
			</ErrorBoundary>
		),
		children: [
			{
				path: Routes.HOME,
				element: (
					<LayoutWrapper>
						<Home />
					</LayoutWrapper>
				),
			},
			{
				path: Routes.ABOUT,
				element: (
					<LayoutWrapper>
						<About />
					</LayoutWrapper>
				),
			},
			{
				path: Routes.TRENDING,
				element: (
					<LayoutWrapper>
						<Trending />
					</LayoutWrapper>
				),
			},
			{
				path: Routes.THREAD,
				element: (
					<LayoutWrapper subnav>
						<Thread />
					</LayoutWrapper>
				),
			},
			{
				path: '*',
				element: (
					<LayoutWrapper>
						<NotFound />
					</LayoutWrapper>
				),
			},
		],
	},
])

export default function RouterProviderWrapper() {
	return <RouterProvider router={router} />
}

function LayoutWrapper({ children, subnav }: { children: ReactNode; subnav?: boolean }) {
	return (
		<>
			{subnav && (
				<Box mt={3} ml={1}>
					<BackButton />
				</Box>
			)}
			<Container maxW="container.lg">
				<Box mt="15vh" />
				<ErrorBoundary>{children}</ErrorBoundary>
			</Container>
		</>
	)
}
