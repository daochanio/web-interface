import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";

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
      700: "#262626",
      800: "#1a1a1b",
      900: "#121212",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        fontWeight: "500",
      },
    },
  },
};

const theme = extendTheme(config);

export default function ChakraProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <CacheProvider>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </CacheProvider>
    </>
  );
}
