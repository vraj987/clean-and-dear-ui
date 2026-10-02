import { ChevronDown, Search } from "lucide-react";
import { useId, useMemo, useState } from "react";

export type SearchableOption = { value: string; label: string };

type SearchableSelectProps = {
  options: SearchableOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Search or select…",
  disabled = false,
  loading = false,
  className = "",
}: SearchableSelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLocaleLowerCase().includes(normalized));
  }, [options, query]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <input
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={placeholder}
          autoComplete="off"
          disabled={disabled}
          value={open ? query : (selected?.label ?? "")}
          placeholder={disabled ? "Choose a state first" : placeholder}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 100)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && filtered.length === 1) {
              event.preventDefault();
              onValueChange(filtered[0]!.value);
              setQuery("");
              setOpen(false);
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-[999] max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 text-gray-900 shadow-xl animate-in fade-in-0 zoom-in-95"
        >
          {loading ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">Loading options…</li>
          ) : filtered.length ? (
            filtered.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onValueChange(option.value);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-red-50 hover:text-primary ${option.value === value ? "bg-red-50 font-semibold text-primary" : ""}`}
                >
                  {option.label}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-3 text-sm text-muted-foreground">No matching options</li>
          )}
        </ul>
      )}
    </div>
  );
}
