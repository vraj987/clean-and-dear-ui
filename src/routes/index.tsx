import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "./about";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kimaat Lock — Aaj phone lo, kal ki kimmat fix karo" },
      {
        name: "description",
        content:
          "Choose a Kavach package for the phone you already own and see its month-wise future selling value.",
      },
    ],
  }),
  component: AboutPage,
});
