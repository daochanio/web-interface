import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
  button: {
    _active: {
      bg: "red",
    },
  },
  list: {
    border: "none",
    bg: "gray.800",
  },
  item: {
    bg: "gray.800",
    _hover: {
      bg: "gray.700",
    },
  },
});

export const menuTheme = defineMultiStyleConfig({ baseStyle });
