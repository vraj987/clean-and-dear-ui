import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/input-test")({
  head: () => ({
    meta: [{ title: "Input Test | Kimaat Lock" }],
  }),
  component: InputTestPage,
});

function InputTestPage() {
  const [submittedName, setSubmittedName] = useState("");

  function submitName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmittedName(String(formData.get("name") ?? "").trim());
  }

  return (
    <main className="grid min-h-screen place-items-center bg-white px-5 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Input Test Page</h1>
        <p className="mt-2 text-sm text-slate-600">Enter your name and submit the form.</p>
        <form onSubmit={submitName} className="mt-6 space-y-4">
          <label htmlFor="test-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="test-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your name"
            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
          />
          <button
            type="submit"
            className="h-12 w-full rounded-lg bg-[#0b2a55] px-4 font-semibold text-white transition-colors hover:bg-[#071e3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f58220] focus-visible:ring-offset-2"
          >
            Submit
          </button>
        </form>
        {submittedName && (
          <p role="status" className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            Submitted: {submittedName}
          </p>
        )}
      </section>
    </main>
  );
}
