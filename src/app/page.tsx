"use client";

import { Button, Text } from "@chakra-ui/react";
import Image from "next/image";
import { useIntl } from "react-intl";

export default function Home() {
  const intl = useIntl();

  return (
    <main>
      <div>
        <Text>
          {intl.formatMessage({
            id: "hello-world",
            defaultMessage: `Hello World!`,
          })}
        </Text>
        <Button>
          {intl.formatMessage({
            id: "go",
            defaultMessage: `GO`,
          })}
        </Button>
        <Image alt="logo" src="/1024x1024.png" width={50} height={50} />
      </div>
    </main>
  );
}
