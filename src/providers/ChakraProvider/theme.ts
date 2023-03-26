import { extendTheme } from "@chakra-ui/react";
import { menuTheme } from "./menu";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
  colors: {
    brand: {
      50: "#ffede0",
      100: "#fecfb4",
      200: "#fab387",
      300: "#f79255",
      400: "#f57426",
      500: "#db5b0e",
      600: "#aa4609",
      700: "#7a3205",
      800: "#4a1d00",
      900: "#1d0800",
    },
    gray: {
      600: "#585858",
      700: "#262626",
      800: "#1a1a1b",
      900: "#121212",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
      },
    },
  },
  components: {
    Text: {
      baseStyle: {
        color: "whiteAlpha.900",
        fontWeight: "500",
      },
    },
    Heading: {
      baseStyle: {
        color: "whiteAlpha.900",
      },
    },
    Button: {
      variants: {
        solid: {
          bg: "brand.200",
          fontWeight: "700",
          color: "whiteAlpha.900",
          _hover: {
            bg: "brand.400",
          },
        },
        ghost: {
          bg: "gray.800",
          fontWeight: "700",
          color: "brand.200",
          _hover: {
            bg: "gray.900",
          },
        },
      },
      defaultProps: {
        variant: "solid",
        size: "md",
      },
    },
    Menu: menuTheme,
  },
};

export const theme = extendTheme(config);
