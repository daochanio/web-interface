import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div>
        <p>Hello World!</p>
        <Image alt="logo" src="/logo/1024x1024.png" width={50} height={50} />
      </div>
    </main>
  );
}
