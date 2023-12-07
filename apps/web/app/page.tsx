"use client";

import Link from "next/link";
import { Input, Button } from "../components/ui";
import { useState } from "react";

export default function Page(): JSX.Element {
  const [room, setRoom] = useState("");
  const onChangeRoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoom(e.target.value);
  };

  console.log({ room });
  return (
    <main className="flex flex-col h-full">
      <section className="flex p-5 justify-between">
        <h1>Header</h1>
        <h1>Github</h1>
      </section>
      <section className="flex h-full items-center justify-center">
        <div>
          <div className="flex gap-5">
            <Input
              value={room}
              onChange={onChangeRoom}
              placeholder="Enter room name"
            />
            <Link href={`room/${room}`}>
              <Button className="bg-red-500 min-w-max">Start a chat</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
