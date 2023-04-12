import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Routes } from '../../common/routes'
import About from '../../layout/about'
import Home from '../../layout/home'
import Trending from '../../layout/trending'
import Root from '../../layout/root'
import Thread from '../../layout/thread'

const router = createBrowserRouter([
	{
		path: Routes.HOME,
		element: <Root />,
		children: [
			{
				path: Routes.HOME,
				element: <Home />,
			},
			{
				path: Routes.ABOUT,
				element: <About />,
			},
			{
				path: Routes.TRENDING,
				element: <Trending />,
			},
			{
				path: Routes.THREAD,
				element: <Thread />,
			},
		],
	},
])

export default function RouterProviderWrapper() {
	return <RouterProvider router={router} />
}
