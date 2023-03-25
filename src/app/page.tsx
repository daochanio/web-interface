"use client";

import { Button, Text } from "@chakra-ui/react";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div>
        <Text>Hello World!</Text>
        <Button>Go</Button>
        <Image alt="logo" src="/1024x1024.png" width={50} height={50} />
      </div>
    </main>
  );
}
