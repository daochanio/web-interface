"use client";

import ChakraProvider from "./ChakraProvider";
import IntlProvider from "./IntlProvider";
import WagmiProvider from "./WagmiProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <ChakraProvider>
        <IntlProvider>{children}</IntlProvider>
      </ChakraProvider>
    </WagmiProvider>
  );
}
