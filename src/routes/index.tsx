import { createFileRoute } from "@tanstack/react-router";
import { CircularFlowApp } from "@/components/circular-flow/app";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <CircularFlowApp />;
}
