import type { Route } from "./+types/home";
import { ReadingView } from "../components/ReadingView";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LinguaScaffold - Contextual Language Learning" },
    { name: "description", content: "Learn languages in context with interactive reading support" },
  ];
}

export default function Home() {
  return <ReadingView />;
}
