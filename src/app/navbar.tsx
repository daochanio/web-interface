"use client";

import { useIntl } from "react-intl";
import {
  Box,
  Flex,
  Heading,
  Badge,
  LinkOverlay,
  LinkBox,
  HStack,
  useDisclosure,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  Link as ChakraLink,
  Tooltip,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  MdMenu,
  MdClose,
  MdKeyboardArrowRight,
  MdKeyboardArrowDown,
} from "react-icons/md";
import Image from "next/image";
import ConnectButton from "./connectButton";
import { Routes } from "../common/routes";
import { Link } from "@chakra-ui/next-js";

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href: string;
  isExternal?: boolean;
}

function Navbar() {
  const intl = useIntl();
  const { isOpen, onToggle } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const NAV_ITEMS: Array<NavItem> = [
    {
      label: intl.formatMessage({ id: "trending", defaultMessage: "Trending" }),
      href: Routes.TRENDING,
    },
    {
      label: intl.formatMessage({ id: "more", defaultMessage: "More" }),
      href: "#",
      children: [
        {
          label: intl.formatMessage({ id: "about", defaultMessage: "About" }),
          subLabel: intl.formatMessage(
            { id: "learn-more", defaultMessage: "Learn more about {name}" },
            { name: "Daochan" }
          ),
          href: Routes.ABOUT,
        },
        {
          label: intl.formatMessage({ id: "github", defaultMessage: "GitHub" }),
          subLabel: intl.formatMessage(
            {
              id: "view-sourcecode",
              defaultMessage: "View the source code on {name}",
            },
            { name: "GitHub" }
          ),
          href: "https://github.com/daochanio",
          isExternal: true,
        },
      ],
    },
  ];

  return (
    <>
      <Box
        bg={"gray.800"}
        boxShadow="dark-lg"
        position="fixed"
        zIndex={2}
        width="100%"
      >
        <Flex
          h="7vh"
          alignItems={"center"}
          justifyContent={"space-between"}
          mx={4}
        >
          <Flex>
            <Tooltip
              label={intl.formatMessage({
                id: "open-menu",
                defaultMessage: "Open Menu",
              })}
            >
              <IconButton
                size="md"
                mt={1}
                icon={
                  <Icon
                    color="brand.200"
                    as={isOpen ? MdClose : MdMenu}
                    w={6}
                    h={6}
                  />
                }
                bg="inherit"
                display={{ md: !isOpen ? "none" : "inherit" }}
                onClick={onToggle}
                aria-label="open-menu"
              />
            </Tooltip>
            <HStack alignItems={"center"}>
              <LinkBox>
                <Flex alignItems="center">
                  {!isMobile && (
                    <Image
                      priority
                      alt="logo"
                      src="/1024x1024.png"
                      width={30}
                      height={30}
                    />
                  )}
                  <LinkOverlay href="/" as={Link}>
                    <Heading size="md" as="span" ml={3}>
                      Daochan
                    </Heading>
                  </LinkOverlay>
                  {!isMobile && (
                    <Badge colorScheme="brand" ml={3}>
                      {intl.formatMessage({
                        id: "alpha",
                        defaultMessage: "Alpha",
                      })}
                    </Badge>
                  )}
                  <Box width={30} />
                </Flex>
              </LinkBox>
              {!isMobile && (
                <Flex>
                  <DesktopNav navItems={NAV_ITEMS} />
                </Flex>
              )}
            </HStack>
          </Flex>
          <ConnectButton />
        </Flex>
        <Collapse in={isOpen} animateOpacity>
          <MobileNav navItems={NAV_ITEMS} onToggleMenu={onToggle} />
        </Collapse>
      </Box>
      <Box h="7vh"></Box>
    </>
  );
}

const DesktopNav = ({ navItems }: { navItems: NavItem[] }) => {
  return (
    <Stack direction={"row"} spacing={4} ml={10}>
      {navItems.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} placement={"bottom-start"}>
            <PopoverTrigger>
              <Link
                p={2}
                href={navItem.href}
                fontSize={"md"}
                fontWeight={500}
                color={"gray.200"}
                _hover={{
                  textDecoration: "none",
                  color: "brand.400",
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={"xl"}
                bg={"gray.800"}
                p={4}
                rounded={"xl"}
                minW={"sm"}
              >
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
  );
};

const DesktopSubNav = ({ label, href, subLabel, isExternal }: NavItem) => {
  const linkProps = {
    role: "group",
    display: "block",
    p: 2,
    rounded: "md",
    _hover: { bg: "gray.900" },
    href,
  };

  if (isExternal) {
    return (
      <ChakraLink {...linkProps} isExternal>
        <DesktopLinkBody label={label} subLabel={subLabel} />
      </ChakraLink>
    );
  }

  return (
    <Link {...linkProps}>
      <DesktopLinkBody label={label} subLabel={subLabel} />
    </Link>
  );
};

const DesktopLinkBody = ({
  label,
  subLabel,
}: {
  label: string;
  subLabel: string | undefined;
}) => {
  return (
    <Stack direction={"row"} align={"center"}>
      <Box>
        <Text
          transition={"all .3s ease"}
          _groupHover={{ color: "brand.400" }}
          fontWeight={500}
        >
          {label}
        </Text>
        <Text fontSize={"sm"}>{subLabel}</Text>
      </Box>
      <Flex
        transition={"all .3s ease"}
        transform={"translateX(-10px)"}
        opacity={0}
        _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
        justify={"flex-end"}
        align={"center"}
        flex={1}
      >
        <Icon color={"brand.400"} w={5} h={5} as={MdKeyboardArrowRight} />
      </Flex>
    </Stack>
  );
};

const MobileNav = ({
  navItems,
  onToggleMenu,
}: {
  navItems: NavItem[];
  onToggleMenu: () => void;
}) => {
  return (
    <Stack bg={"gray.800"} p={4} display={{ md: "none" }}>
      {navItems.map((navItem) => (
        <MobileNavItem
          key={navItem.label}
          {...navItem}
          onToggleMenu={onToggleMenu}
        />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({
  label,
  children,
  href,
  onToggleMenu,
}: NavItem & { onToggleMenu: () => void }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack
      spacing={4}
      onClick={() => {
        if (children) {
          onToggle();
        } else {
          onToggleMenu();
        }
      }}
    >
      <Flex
        py={2}
        as={Link}
        href={href}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
          color: "brand.400",
        }}
      >
        <Text fontWeight={600}>{label}</Text>
        {children && (
          <Icon
            as={MdKeyboardArrowDown}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={"gray.700"}
          align={"start"}
        >
          {children &&
            children.map(({ label, href, isExternal }) => {
              const props = {
                href,
                py: 2,
                onClick: onToggleMenu,
                _hover: {
                  textDecoration: "none",
                  color: "brand.400",
                },
              };
              if (isExternal) {
                return (
                  <ChakraLink key={label} isExternal {...props}>
                    {label}
                  </ChakraLink>
                );
              }
              return (
                <Link key={label} {...props}>
                  {label}
                </Link>
              );
            })}
        </Stack>
      </Collapse>
    </Stack>
  );
};

export default Navbar;
