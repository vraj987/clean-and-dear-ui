import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

/** UI-only invoice upload. OCR intentionally lives nowhere else and is not implemented. */
export function InvoiceOcrPlaceholder({
  onFileChange,
}: {
  onFileChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  function selectFile(file?: File) {
    setFileName(file?.name ?? "");
    onFileChange(file ?? null);
  }

  return (
    <section
      className="rounded-2xl border border-dashed border-primary/50 bg-primary-soft/40 p-5"
      aria-labelledby="invoice-upload-title"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-primary">
          <FileText className="size-5" />
        </span>
        <div>
          <h3 id="invoice-upload-title" className="font-semibold">
            Upload your purchase invoice
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Add a photo or PDF of your invoice. This preview only records the filename; no OCR or
            data extraction runs.
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        className="sr-only"
        onChange={(event) => selectFile(event.currentTarget.files?.[0])}
      />
      {fileName ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-background p-3">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <FileText className="size-4 shrink-0 text-primary" />
            <span className="truncate">{fileName}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              selectFile();
            }}
            aria-label="Remove invoice"
            className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-xl bg-background text-sm font-semibold transition hover:bg-muted"
        >
          <Upload className="size-5 text-primary" />
          Choose invoice file{" "}
          <span className="text-xs font-normal text-muted-foreground">JPG, PNG or PDF</span>
        </button>
      )}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Invoice reader placeholder · UI only · OCR not connected
      </p>
    </section>
  );
}
