import { SearchBox } from "@/app/SearchBox";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold">InWheel — Vevey</h1>
      <SearchBox />
    </main>
  );
}
