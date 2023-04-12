import { useIntl } from 'react-intl'
import {
	Box,
	Flex,
	Heading,
	LinkOverlay,
	LinkBox,
	useDisclosure,
	Stack,
	Collapse,
	Icon,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Text,
	useBreakpointValue,
	Img,
	Link,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md'
import ConnectButton from './connectButton'
import { Routes } from '../../common/routes'

interface NavItem {
	label: string
	subLabel?: string
	children?: Array<NavItem>
	href: string
	isExternal?: boolean
	isMobileOnly?: boolean
}

function Navbar() {
	const intl = useIntl()
	const { isOpen, onToggle } = useDisclosure()
	const isMobile = useBreakpointValue({ base: true, md: false })

	const NAV_ITEMS: Array<NavItem> = [
		{
			label: intl.formatMessage({ id: 'home', defaultMessage: 'Home' }),
			href: Routes.HOME,
			isMobileOnly: true,
		},
		{
			label: intl.formatMessage({ id: 'trending', defaultMessage: 'Trending' }),
			href: Routes.TRENDING,
		},
		{
			label: intl.formatMessage({ id: 'more', defaultMessage: 'More' }),
			href: '',
			children: [
				{
					label: intl.formatMessage({ id: 'about', defaultMessage: 'About' }),
					subLabel: intl.formatMessage(
						{ id: 'learn-more', defaultMessage: 'Learn more about {name}' },
						{ name: 'Daochan' }
					),
					href: Routes.ABOUT,
				},
				{
					label: intl.formatMessage({ id: 'github', defaultMessage: 'GitHub' }),
					subLabel: intl.formatMessage(
						{
							id: 'view-sourcecode',
							defaultMessage: 'View the source code on {name}',
						},
						{ name: 'GitHub' }
					),
					href: 'https://github.com/daochanio',
					isExternal: true,
				},
			],
		},
	]

	return (
		<>
			<Box bg={'gray.800'} boxShadow="dark-lg" position="fixed" zIndex={2} width="100%">
				<Flex h="7vh" alignItems={'center'} mx={4}>
					{isMobile ? <MobileLogo isOpen={isOpen} onToggle={onToggle} /> : <DesktopLogo />}
					{!isMobile && <DesktopNav navItems={NAV_ITEMS} />}
					<Box flexGrow={1} />
					<Box mt={1}>
						<ConnectButton />
					</Box>
				</Flex>
				{isMobile && (
					<Collapse in={isOpen} animateOpacity>
						<MobileNav navItems={NAV_ITEMS} onToggleMenu={onToggle} />
					</Collapse>
				)}
			</Box>
			<Box h="7vh"></Box>
		</>
	)
}

const DesktopLogo = () => {
	return (
		<LinkBox>
			<Flex alignItems="center">
				<Img alt="logo" src="/1024x1024.png" width={30} height={30} />
				<LinkOverlay to="/" as={RouterLink}>
					<Heading size="md" as="span" ml={3}>
						Daochan
					</Heading>
				</LinkOverlay>
			</Flex>
		</LinkBox>
	)
}

const MobileLogo = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
	return (
		<Flex alignItems="center" as="button" onClick={onToggle}>
			<Img alt="logo" src="/1024x1024.png" width={30} height={30} />
			<Heading size="md" as="span" ml={3} mr={2}>
				Daochan
			</Heading>
			<Icon
				as={MdKeyboardArrowDown}
				mt={1}
				transition={'all .25s ease-in-out'}
				transform={isOpen ? 'rotate(180deg)' : ''}
			/>
		</Flex>
	)
}

const DesktopNav = ({ navItems }: { navItems: NavItem[] }) => {
	return (
		<Stack direction={'row'} spacing={4} ml={10} alignItems="center">
			{navItems
				.filter((navItem) => !navItem.isMobileOnly)
				.map((navItem) => (
					<Box key={navItem.label}>
						<Popover trigger={'hover'} placement={'bottom-start'}>
							<PopoverTrigger>
								{!navItem.children ? (
									<Link
										as={RouterLink}
										p={2}
										to={navItem.href ?? ''}
										fontSize={'md'}
										fontWeight={500}
										color={'gray.200'}
										_hover={{
											textDecoration: 'none',
											color: 'brand.200',
										}}
									>
										{navItem.label}
									</Link>
								) : (
									<Text
										as="button"
										p={2}
										fontSize={'md'}
										fontWeight={500}
										color={'gray.200'}
										_hover={{
											textDecoration: 'none',
											color: 'brand.200',
										}}
									>
										{navItem.label}
									</Text>
								)}
							</PopoverTrigger>
							{navItem.children && (
								<PopoverContent border={0} boxShadow={'xl'} bg={'gray.800'} p={4} rounded={'xl'} minW={'sm'}>
									<Stack>
										{navItem.children.map((child) => (
											<DesktopSubNav key={child.label} {...child} />
										))}
									</Stack>
								</PopoverContent>
							)}
						</Popover>
					</Box>
				))}
		</Stack>
	)
}

const DesktopSubNav = ({ label, href, subLabel, isExternal }: NavItem) => {
	return (
		<Link
			as={RouterLink}
			isExternal={isExternal}
			role="group"
			display="block"
			p={2}
			rounded="md"
			_hover={{ bg: 'gray.900' }}
			to={href}
		>
			<DesktopLinkBody label={label} subLabel={subLabel} />
		</Link>
	)
}

const DesktopLinkBody = ({ label, subLabel }: { label: string; subLabel: string | undefined }) => {
	return (
		<Stack direction={'row'} align={'center'}>
			<Box>
				<Text transition={'all .3s ease'} _groupHover={{ color: 'brand.400' }} fontWeight={500}>
					{label}
				</Text>
				<Text fontSize={'sm'}>{subLabel}</Text>
			</Box>
			<Flex
				transition={'all .3s ease'}
				transform={'translateX(-10px)'}
				opacity={0}
				_groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
				justify={'flex-end'}
				align={'center'}
				flex={1}
			>
				<Icon color={'brand.400'} w={5} h={5} as={MdKeyboardArrowRight} />
			</Flex>
		</Stack>
	)
}

const MobileNav = ({ navItems, onToggleMenu }: { navItems: NavItem[]; onToggleMenu: () => void }) => {
	return (
		<Stack bg={'gray.800'} p={4} display={{ md: 'none' }}>
			{navItems.map((navItem) => (
				<MobileNavItem key={navItem.label} {...navItem} onToggleMenu={onToggleMenu} />
			))}
		</Stack>
	)
}

const MobileNavItem = ({ label, children, href, onToggleMenu }: NavItem & { onToggleMenu: () => void }) => {
	const { isOpen, onToggle } = useDisclosure()

	return (
		<Stack
			spacing={4}
			onClick={() => {
				if (children) {
					onToggle()
				} else {
					onToggleMenu()
				}
			}}
		>
			<Flex py={2} as={RouterLink} to={href} justify={'space-between'} align={'center'}>
				<Text
					_hover={{
						textDecoration: 'none',
						color: 'brand.200',
					}}
					fontWeight={600}
				>
					{label}
				</Text>
				{children && (
					<Icon
						as={MdKeyboardArrowDown}
						transition={'all .25s ease-in-out'}
						transform={isOpen ? 'rotate(180deg)' : ''}
					/>
				)}
			</Flex>

			<Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
				<Stack mt={2} pl={4} borderLeft={1} borderStyle={'solid'} borderColor={'gray.700'} align={'start'}>
					{children &&
						children.map(({ label, href, isExternal }) => {
							return (
								<Link
									key={label}
									as={RouterLink}
									isExternal={isExternal}
									to={href}
									py={2}
									onClick={onToggleMenu}
									color="whiteAlpha.900"
									_hover={{
										textDecoration: 'none',
										color: 'brand.400',
									}}
								>
									{label}
								</Link>
							)
						})}
				</Stack>
			</Collapse>
		</Stack>
	)
}

export default Navbar
