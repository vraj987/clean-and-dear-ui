// src\client.tsx
import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { StartClient } from "@tanstack/react-start/client";

import { getRouter } from "./router";
import "./styles.css";

const rootElement = document.getElementById("root");

if (import.meta.env.DEV) {
  // Development is served by TanStack Start, so hydrate its server-rendered shell.
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  });
} else {
  // The production Hostinger build is a static browser-only React app.
  if (!rootElement) {
    throw new Error("Application root element was not found.");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={getRouter()} />
    </StrictMode>,
  );
}
