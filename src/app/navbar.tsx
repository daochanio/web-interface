"use client";

import Image from "next/image";
import ConnectButton from "./connectButton";

export default function NavBar() {
  return (
    <div>
      <Image priority alt="logo" src="/1024x1024.png" width={50} height={50} />
      <ConnectButton />
    </div>
  );
}
