import type { Route } from "./+types/home";
import { ReadingView } from "../components/ReadingView";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lexis" },
    { name: "description", content: "Learn vocabulary in context with interactive reading support" },
  ];
}

export default function Home() {
  return <ReadingView />;
}
