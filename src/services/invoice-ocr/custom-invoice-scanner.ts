import { createWorker, OEM, PSM } from "tesseract.js";
import PdfJsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

export type InvoiceScanFields = {
  invoiceNumber: string;
  imeiNumber: string;
  serialNumber: string;
  purchaseDate: string;
  finalAmount: string;
};

export type InvoiceScanProgress = (progress: number, message: string) => void;

export async function scanInvoiceFile(
  file: File,
  onProgress: InvoiceScanProgress,
): Promise<InvoiceScanFields> {
  onProgress(2, "Opening the invoice on this device…");
  const pages = await makeOcrPages(file, onProgress);
  if (!pages.length) throw new Error("No readable pages were found in this file.");

  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  const pageText: string[] = [];
  let activePage = 0;
  try {
    worker = await createWorker("eng", OEM.LSTM_ONLY, {
      logger: ({ status, progress }) => {
        if (status.includes("recognizing")) {
          const total = pages.length;
          const percent = 28 + Math.round(((activePage + progress) / total) * 67);
          onProgress(Math.min(96, percent), `Reading invoice text · page ${activePage + 1} of ${total}`);
        } else if (status.includes("language")) {
          onProgress(16, "Preparing the English text reader…");
        } else if (status.includes("core")) {
          onProgress(8, "Starting the on-device scanner…");
        }
      },
    });
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
    });

    for (let index = 0; index < pages.length; index += 1) {
      const pageCanvas = pages[index];
      if (!pageCanvas) continue;
      activePage = index;
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
      onProgress(28 + Math.round((index / pages.length) * 65), `Reading invoice text · page ${index + 1} of ${pages.length}`);
      const result = await worker.recognize(pageCanvas, { rotateAuto: true });
      let recognizedText = result.data.text;
      let fields = extractInvoiceFields(recognizedText);
      if (!fields.invoiceNumber || !fields.imeiNumber || !fields.purchaseDate || !fields.finalAmount) {
        await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
        const structuredResult = await worker.recognize(pageCanvas, { rotateAuto: true });
        recognizedText = `${structuredResult.data.text}\n${recognizedText}`;
        fields = extractInvoiceFields(recognizedText);
      }
      if (!fields.invoiceNumber || !fields.purchaseDate || !fields.finalAmount) {
        onProgress(30 + Math.round((index / pages.length) * 65), `Enhancing invoice text · page ${index + 1} of ${pages.length}`);
        const enhanced = enhanceForOcr(pageCanvas);
        try {
          await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
          const enhancedResult = await worker.recognize(enhanced, { rotateAuto: true });
          recognizedText = `${enhancedResult.data.text}\n${recognizedText}`;
        } finally {
          if (enhanced !== pageCanvas) enhanced.width = enhanced.height = 0;
        }
      }
      pageText.push(recognizedText);
    }
  } finally {
    await worker?.terminate();
    pages.forEach((page) => {
      if (page.dataset["ownedCanvas"] === "true") page.width = page.height = 0;
    });
  }

  const fields = extractInvoiceFields(pageText.join("\n"));
  onProgress(100, "Scan complete. Review the detected details below.");
  return fields;
}

function enhanceForOcr(source: HTMLCanvasElement) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return source;
  context.filter = "grayscale(1) contrast(1.25) brightness(1.06)";
  context.drawImage(source, 0, 0);
  context.filter = "none";
  return canvas;
}

async function makeOcrPages(file: File, onProgress: InvoiceScanProgress) {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    onProgress(5, "Opening PDF pages…");
    const pdfjs = await import("pdfjs-dist");
    // Bundle the worker through Vite instead of asking PDF.js to dynamically
    // import a .mjs URL at runtime. Some shared hosts serve .mjs with an
    // unsupported MIME type, which makes PDF.js fall back to a failing fake worker.
    pdfjs.GlobalWorkerOptions.workerPort ??= new PdfJsWorker();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    const pdfDocument = await loadingTask.promise;
    const canvases: HTMLCanvasElement[] = [];
    try {
      const maxPages = Math.min(pdfDocument.numPages, 5);
      for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const original = page.getViewport({ scale: 1 });
        const scale = Math.min(3, 2400 / original.width);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.dataset["ownedCanvas"] = "true";
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Could not prepare a PDF page for scanning.");
        await page.render({ canvas, canvasContext: context, viewport, background: "#ffffff" }).promise;
        canvases.push(canvas);
        onProgress(8 + Math.round((pageNumber / maxPages) * 18), `Preparing PDF page ${pageNumber} of ${maxPages}…`);
      }
      return canvases;
    } catch (error) {
      canvases.forEach((canvas) => (canvas.width = canvas.height = 0));
      throw error;
    } finally {
      await loadingTask.destroy();
    }
  }

  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic|heif|bmp|tiff?)$/i.test(file.name)) {
    throw new Error("Choose an invoice image or PDF file.");
  }

  onProgress(6, "Preparing invoice photo…");
  const canvas = await imageFileToCanvas(file);
  canvas.dataset["ownedCanvas"] = "true";
  return [canvas];
}

async function imageFileToCanvas(file: File) {
  const heic = await import("@su-engineering/heic");
  if ((await heic.isHeic(file)).isHeic) {
    try {
      const { wasmDecoder } = await import("@su-engineering/heic/wasm");
      const decoded = await heic.decodeHeic(file, {
        maxDimension: 3000,
        wasmLoader: async () => wasmDecoder,
      });
      try {
        const canvas = document.createElement("canvas");
        canvas.width = decoded.width;
        canvas.height = decoded.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Could not prepare this iPhone photo for scanning.");
        context.drawImage(decoded.image, 0, 0);
        return canvas;
      } finally {
        decoded.image.close();
      }
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Could not open this HEIC/HEIF photo: ${error.message}`
          : "Could not open this HEIC/HEIF photo. Try saving it as JPG and upload again.",
      );
    }
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("Could not open this image. Try uploading it as JPG or PNG.");
  try {
    const scale = Math.min(1, 3000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Could not prepare this photo for scanning.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    bitmap.close();
  }
}

function extractInvoiceFields(text: string): InvoiceScanFields {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[\u00a0|]/g, " ")
    .replace(/\n{3,}/g, "\n\n");
  const invoiceNumber = extractInvoiceNumber(normalized);

  const imeiNumber = extractImei(normalized);

  const serialMatch = normalized.match(
    /(?:SERIAL\s*(?:NO\.?|NUMBER)?|S\s*\/\s*N|SL\s*NO\.?)\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\/.\-]{3,})/i,
  );
  const dateTail = findAfterLabel(
    normalized,
    /\b(?:INVOICE\s*DATE|BILL\s*DATE|PURCHASE\s*DATE|DT\.?|DATE)\s*[:#\-]?/i,
    100,
  );
  const dateMatch = dateTail.match(/\b(\d{1,2}[\s/.-]+[A-Z0-9]{3,9}[\s/.-]+\d{2,4}|\d{1,4}[\/.-]\d{1,2}[\/.-]\d{2,4})\b/i);

  return {
    invoiceNumber,
    imeiNumber,
    serialNumber: cleanToken(serialMatch?.[1] ?? ""),
    purchaseDate: parseInvoiceDate(dateMatch?.[1] ?? ""),
    finalAmount: resolveFinalAmount(normalized),
  };
}

function extractInvoiceNumber(text: string) {
  const labels = [...text.matchAll(/\bINVOICE\s*(?:NO\.?|NUMBER|#)\s*[:#\-]?/gi)];
  for (const label of labels) {
    const start = (label.index ?? 0) + label[0].length;
    const tail = text.slice(start, start + 140).toUpperCase();
    const candidates = tail.match(/[A-Z0-9][A-Z0-9/.-]{3,}/g) ?? [];
    const value = candidates.find((candidate) =>
      candidate.length >= 5 && (/^\d{5,}$/.test(candidate) || (/[A-Z]/.test(candidate) && /\d/.test(candidate) && candidate.length >= 6)),
    );
    if (value) return cleanToken(value);
  }
  return "";
}

function extractImei(text: string) {
  const labels = [...text.matchAll(/\bIMEI(?:\s*(?:NO\.?|NUMBER|1|2))?\s*[:#\-]?/gi)];
  if (!labels.length) return "";
  const valid = new Set<string>();
  const labeledValues = new Set<string>();
  for (const [index, label] of labels.entries()) {
    const start = (label.index ?? 0) + label[0].length;
    const nextLabelStart = labels[index + 1]?.index ?? start + 120;
    const tail = text
      .slice(start, Math.min(nextLabelStart, start + 120))
      .toUpperCase()
      .replace(/[OQD]/g, "0")
      .replace(/[IL|]/g, "1");
    const groups = tail.match(/(?:\d[\s-]*){14,18}/g) ?? [];
    for (const group of groups) {
      const digits = group.replace(/\D/g, "");
      if (digits.length === 15) labeledValues.add(digits);
      for (let digitStart = 0; digitStart <= digits.length - 15; digitStart += 1) {
        const candidate = digits.slice(digitStart, digitStart + 15);
        if (isValidImei(candidate)) valid.add(candidate);
      }
    }
  }
  return [...(valid.size ? valid : labeledValues)].slice(0, 2).join(" | ");
}

function isValidImei(value: string) {
  if (!/^\d{15}$/.test(value)) return false;
  let sum = 0;
  for (let index = 0; index < value.length - 1; index += 1) {
    let digit = Number(value[index]);
    if ((value.length - index) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return (10 - (sum % 10)) % 10 === Number(value.at(-1));
}

function findAfterLabel(text: string, label: RegExp, maxLength: number) {
  const match = label.exec(text);
  return match ? text.slice(match.index + match[0].length, match.index + match[0].length + maxLength) : "";
}

function findFinalAmount(text: string) {
  const amountPattern = /(?:₹|INR)?\s*(?:\d{1,3}(?:,\d{2,3})+|\d{4,9})(?:\.\d{1,2})?/gi;
  const labelPattern = /NET\s*SALES\s*VALUE|NET\s*TOTAL|GRAND\s*TOTAL|INVOICE\s*TOTAL|AMOUNT\s+PAYABLE|TOTAL\s+(?:PAYABLE|DUE|AMOUNT)|(?<![A-Z])TOTAL\s*:/gi;
  const labelMatches = [...text.matchAll(labelPattern)].sort((first, second) => {
    const priority = (value: string) =>
      /NET\s*SALES\s*VALUE/i.test(value)
        ? 5
        : /NET\s*TOTAL/i.test(value)
          ? 4
          : /GRAND\s*TOTAL/i.test(value)
            ? 3
            : /TOTAL\s*:/i.test(value)
              ? 1
              : 2;
    return priority(second[0]) - priority(first[0]);
  });

  for (const match of labelMatches) {
    const start = (match.index ?? 0) + match[0].length;
    const lineEnd = text.indexOf("\n", start);
    const sameLine = text.slice(start, lineEnd < 0 ? start + 180 : lineEnd);
    const sameLineAmounts = [...sameLine.matchAll(amountPattern)];
    const sameLineValue = sameLineAmounts.at(-1)?.[0].replace(/[^\d.]/g, "") ?? "";
    if (sameLineValue) return sameLineValue;

    // OCR often separates a total label and its value with blank lines or table-cell breaks.
    const followingLines = lineEnd < 0 ? [] : text.slice(lineEnd + 1, lineEnd + 240).split("\n").slice(0, 5);
    for (const followingLine of followingLines) {
      const nextLineAmounts = [...followingLine.matchAll(amountPattern)];
      const nextLineValue = nextLineAmounts.at(-1)?.[0].replace(/[^\d.]/g, "") ?? "";
      if (nextLineValue) return nextLineValue;
    }
  }
  return "";
}

function findAmountInWords(text: string) {
  const phrase = findAfterLabel(text, /AMOUNT\s+IN\s+WORDS?\s*[:#\-]?/i, 180)
    .split(/\n|TERMS\s+AND?\s+CONDITIONS|DIGITALLY\s+SIGNED/i)[0]
    ?.replace(/\b(?:RUPEES?|INR|RS\.?|ONLY)\b/gi, " ")
    .trim();
  if (!phrase) return "";

  const smallNumbers: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19,
  };
  const tens: Record<string, number> = {
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  };
  const tokens = phrase.toLowerCase().match(/[a-z]+/g) ?? [];
  let current = 0;
  let total = 0;
  let recognizedNumber = false;

  for (const token of tokens) {
    if (token in smallNumbers) {
      current += smallNumbers[token] ?? 0;
      recognizedNumber = true;
    } else if (token in tens) {
      current += tens[token] ?? 0;
      recognizedNumber = true;
    } else if (token === "hundred") {
      current = Math.max(current, 1) * 100;
    } else if (["thousand", "lakh", "lac", "crore"].includes(token.replace(/s$/, ""))) {
      const scale = token.replace(/s$/, "");
      const multiplier = scale === "thousand" ? 1_000 : scale === "crore" ? 10_000_000 : 100_000;
      total += Math.max(current, 1) * multiplier;
      current = 0;
    }
  }

  const amount = total + current;
  return recognizedNumber && amount > 0 ? String(amount) : "";
}

function resolveFinalAmount(text: string) {
  const numericAmount = findFinalAmount(text);
  const amountInWords = findAmountInWords(text);
  if (!numericAmount) return amountInWords;
  if (!amountInWords) return numericAmount;
  return Math.round(Number(numericAmount)) === Number(amountInWords) ? numericAmount : amountInWords;
}

function cleanToken(value: string) {
  return value.replace(/[|]/g, "I").replace(/\s+/g, "").replace(/^[^A-Z0-9]+|[^A-Z0-9]+$/gi, "");
}

function parseInvoiceDate(value: string) {
  const normalized = value
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/\b0(CT(?:OBER)?)\b/g, "O$1")
    .trim();
  const monthNames: Record<string, number> = {
    JAN: 1, JANUARY: 1, FEB: 2, FEBRUARY: 2, MAR: 3, MARCH: 3, APR: 4, APRIL: 4,
    MAY: 5, JUN: 6, JUNE: 6, JUL: 7, JULY: 7, AUG: 8, AUGUST: 8,
    SEP: 9, SEPT: 9, SEPTEMBER: 9, OCT: 10, OCTOBER: 10, NOV: 11, NOVEMBER: 11,
    DEC: 12, DECEMBER: 12,
  };
  const named = normalized.match(/^(\d{1,2})[\s/.-]+([A-Z]{3,9})[\s/.-]+(\d{2,4})$/);
  if (named) {
    const month = monthNames[named[2]?.slice(0, 9) ?? ""];
    const day = Number(named[1]);
    const year = normalizeYear(Number(named[3]));
    return month ? formatDate(year, month, day) : "";
  }
  const numeric = normalized.match(/^(\d{1,4})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (!numeric) return "";
  const first = Number(numeric[1]);
  const second = Number(numeric[2]);
  const third = Number(numeric[3]);
  if (first > 31) return formatDate(first, second, third);
  return formatDate(normalizeYear(third), second, first);
}

function normalizeYear(year: number) {
  return year < 100 ? year + (year < 50 ? 2000 : 1900) : year;
}

function formatDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
