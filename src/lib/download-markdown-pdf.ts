import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeFilename(title: string): string {
  const s = title.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "");
  return s.slice(0, 80) || "document";
}

/**
 * Renders markdown to HTML, sanitizes it, and downloads a PDF in the browser
 * using html2canvas + jsPDF (same paging approach as html2pdf.js worker).
 */
export async function downloadMarkdownAsPdf(title: string, markdown: string): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const parsed = await marked.parse(markdown, { async: true, gfm: true });
  const safe = DOMPurify.sanitize(typeof parsed === "string" ? parsed : String(parsed));

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-pdf-export", "true");
  Object.assign(wrapper.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: "794px",
    minHeight: "200px",
    padding: "32px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    color: "#111111",
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: "14px",
    lineHeight: "1.5",
    zIndex: "2147483646",
    overflow: "visible",
  });
  wrapper.innerHTML = `
    <style>
      .md-export img { max-width: 100%; height: auto; }
      .md-export pre { white-space: pre-wrap; word-break: break-word; background: #f4f4f5; padding: 0.75rem; border-radius: 6px; }
      .md-export code { font-size: 0.9em; }
      .md-export table { border-collapse: collapse; width: 100%; }
      .md-export th, .md-export td { border: 1px solid #ddd; padding: 6px 8px; }
    </style>
    <h1 style="font-size:1.35rem;font-weight:600;margin:0 0 1rem 0;">${escapeHtml(title)}</h1>
    <div class="md-export">${safe}</div>
  `;

  document.body.appendChild(wrapper);

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    const margin: [number, number, number, number] = [10, 10, 10, 10];
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidthMm = pdf.internal.pageSize.getWidth();
    const pageHeightMm = pdf.internal.pageSize.getHeight();
    const innerWidth = pageWidthMm - margin[1] - margin[3];
    const innerHeight = pageHeightMm - margin[0] - margin[2];
    const innerRatio = innerHeight / innerWidth;

    const pxFullHeight = canvas.height;
    const pxPageHeight = Math.max(1, Math.floor(canvas.width * innerRatio));
    const nPages = Math.max(1, Math.ceil(pxFullHeight / pxPageHeight));

    const pageCanvas = document.createElement("canvas");
    const pageCtx = pageCanvas.getContext("2d");
    if (!pageCtx) {
      throw new Error("Could not create canvas context for PDF.");
    }

    pageCanvas.width = canvas.width;

    const imageQuality = 0.92;

    for (let page = 0; page < nPages; page++) {
      let pageHeightMm = innerHeight;

      if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
        pageCanvas.height = pxFullHeight % pxPageHeight;
        pageHeightMm = (pageCanvas.height * innerWidth) / pageCanvas.width;
      } else {
        pageCanvas.height = pxPageHeight;
      }

      const w = pageCanvas.width;
      const h = pageCanvas.height;
      pageCtx.fillStyle = "white";
      pageCtx.fillRect(0, 0, w, h);
      pageCtx.drawImage(canvas, 0, page * pxPageHeight, w, h, 0, 0, w, h);

      const imgData = pageCanvas.toDataURL("image/jpeg", imageQuality);
      if (page > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "JPEG", margin[1], margin[0], innerWidth, pageHeightMm);
    }

    pdf.save(`${sanitizeFilename(title)}.pdf`);
  } finally {
    wrapper.remove();
  }
}
