"use client";

import { Button } from "@chakra-ui/react";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div>
        <p>Hello World!</p>
        <Button colorScheme="brand">Go</Button>
        <Image alt="logo" src="/logo/1024x1024.png" width={50} height={50} />
      </div>
    </main>
  );
}
