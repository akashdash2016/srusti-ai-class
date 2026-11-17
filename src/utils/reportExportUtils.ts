import { toJpeg, toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { buildReportCsv } from './reportUtils';

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function isIgnored(node: HTMLElement): boolean {
  return node.dataset?.exportIgnore === 'true';
}

/**
 * Captures the dashboard at a resolution that stays inside typical browser
 * canvas limits, even when the full student register (154 rows) is visible.
 * The node is temporarily laid out at the report's designed 1180px width so
 * exports stay consistent on tablets and phones too.
 */
async function captureDashboard(
  elementId: string,
  mode: 'png' | 'pdf'
): Promise<string | null> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element with id '${elementId}' not found`);
    return null;
  }

  const previousWidth = node.style.width;
  const previousMaxWidth = node.style.maxWidth;

  try {
    node.style.width = '1180px';
    node.style.maxWidth = 'none';

    // Force a reflow so the height reflects the export width
    const width = 1180;
    const height = Math.max(node.scrollHeight, node.offsetHeight, 1000);

    // Browsers cap canvas dimensions (Chrome at 16384px). Keep a small margin.
    const maxDimensionRatio = 16000 / height;
    let pixelRatio: number;
    if (mode === 'png') {
      // ~40 megapixels keeps text crisp without hitting canvas limits.
      pixelRatio = Math.max(1, Math.min(2.5, maxDimensionRatio, Math.sqrt(40_000_000 / (width * height))));
    } else {
      // PDF only needs ~2200px of width; bigger captures just inflate the file.
      pixelRatio = Math.max(1, Math.min(2, 2200 / width, maxDimensionRatio));
    }

    const options = {
      quality: 0.94,
      pixelRatio,
      width,
      height,
      backgroundColor: '#ffffff',
      cacheBust: true,
      filter: (child: HTMLElement) => !isIgnored(child),
      style: { margin: '0', transform: 'none' },
    };

    return mode === 'png' ? await toPng(node, options) : await toJpeg(node, options);
  } finally {
    node.style.width = previousWidth;
    node.style.maxWidth = previousMaxWidth;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load captured dashboard'));
    img.src = src;
  });
}

export async function exportReportPng(elementId: string): Promise<boolean> {
  try {
    const dataUrl = await captureDashboard(elementId, 'png');
    if (!dataUrl) return false;
    const link = document.createElement('a');
    link.download = `Assignment_Report_${timestamp()}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Report PNG export failed', error);
    return false;
  }
}

/** Paginates the full report across clean A4 portrait pages. */
export async function exportReportPdf(elementId: string): Promise<boolean> {
  try {
    const dataUrl = await captureDashboard(elementId, 'pdf');
    if (!dataUrl) return false;

    const img = await loadImage(dataUrl);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2 - 6; // reserve room for the footer

    const pxPerMm = img.width / usableWidth;
    const sliceHeightPx = Math.max(1, Math.floor(usableHeight * pxPerMm));
    const pageCount = Math.ceil(img.height / sliceHeightPx);

    for (let page = 0; page < pageCount; page += 1) {
      if (page > 0) pdf.addPage();

      const sourceY = page * sliceHeightPx;
      const sliceHeight = Math.min(sliceHeightPx, img.height - sourceY);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = sliceHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, sourceY, img.width, sliceHeight, 0, 0, img.width, sliceHeight);

      const renderedHeightMm = sliceHeight / pxPerMm;
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.9),
        'JPEG',
        margin,
        margin,
        usableWidth,
        renderedHeightMm,
        undefined,
        'FAST'
      );

      pdf.setFontSize(7.5);
      pdf.setTextColor(120, 130, 145);
      pdf.text(
        `Srusti MBA · Assignment Report · page ${page + 1} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 4,
        { align: 'center' }
      );
    }

    pdf.save(`Assignment_Report_${timestamp()}.pdf`);
    return true;
  } catch (error) {
    console.error('Report PDF export failed', error);
    return false;
  }
}

export function exportReportCsv(): void {
  const csv = buildReportCsv();
  downloadBlob(
    new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    `Assignment_Report_${timestamp()}.csv`
  );
}
