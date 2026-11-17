import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import type { AttendanceRecord, StudentAttendance, StudentGroup } from '../types/attendance';

/**
 * Copies text to user's clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-https or older browser environments
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Formats sequence string: "P P A P | P P P P | A A P A | ..."
 */
export function generateSequenceString(groups: StudentGroup[]): string {
  return groups.map((g) => g.sequenceString).join(' | ');
}

/**
 * Formats register format string:
 * 1-P 2-P 3-A 4-P
 * 5-P 6-P 7-P 8-P
 * ...
 */
export function generateRegisterFormatString(groups: StudentGroup[]): string {
  return groups
    .map((g) =>
      g.students.map((s) => `${s.rollNumber}-${s.status}`).join(' ')
    )
    .join('\n');
}

/**
 * Formats absent list: "3, 9, 10, 11..."
 */
export function generateAbsenteeListString(
  attendanceList: StudentAttendance[],
  section: string,
  formattedDate: string
): string {
  const absentees = attendanceList
    .filter((s) => s.status === 'A')
    .map((s) => s.rollNumber);
  
  if (absentees.length === 0) {
    return `No Absentees for ${section} on ${formattedDate}! 🎉 All ${attendanceList.length} students are Present.`;
  }

  return `Absent Roll Numbers (${absentees.length}) - ${section} (${formattedDate}):\n${absentees.join(', ')}`;
}

/**
 * Triggers browser download for CSV file
 */
export function exportToCSV(
  record: AttendanceRecord,
  attendanceList: StudentAttendance[]
): void {
  const headers = ['Date', 'Section', 'Roll Number', 'Student Name', 'Status', 'Group'];
  const rows = attendanceList.map((item) => {
    const groupNum = Math.ceil(item.rollNumber / record.groupSize);
    return [
      record.formattedDate,
      `"${record.section}"`,
      item.rollNumber,
      `"${(item.name ?? '').replace(/"/g, '""')}"`,
      item.status === 'P' ? 'Present' : 'Absent',
      `Group ${groupNum}`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Attendance_${record.section.replace(/\s+/g, '_')}_${record.date}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Captures target HTML container and exports as PNG image
 */
export async function exportToPNG(
  elementId: string,
  filename: string,
  backgroundColor: string = '#ffffff'
): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element with id '${elementId}' not found`);
    return false;
  }

  try {
    // Generate high resolution canvas image
    const dataUrl = await toPng(node, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor,
      style: {
        borderRadius: '12px',
        padding: '20px',
      },
    });

    const link = document.createElement('a');
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Error generating PNG image:', error);
    return false;
  }
}

/** Margin used around every PDF page (mm) */
const PDF_MARGIN_MM = 8;
/**
 * Cap the captured image width in pixels. A4 landscape at ~200 DPI only needs
 * around 2200px, so anything larger just bloats the PDF without looking sharper.
 */
const PDF_MAX_IMAGE_WIDTH_PX = 2200;
/** JPEG quality used inside the PDF (lossless PNG is what made files 14–15 MB) */
const PDF_JPEG_QUALITY = 0.85;

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load captured image'));
    img.src = src;
  });
}

/** Captures the node as a white, downscaled canvas suitable for PDF embedding */
async function captureNodeForPDF(node: HTMLElement): Promise<HTMLCanvasElement> {
  const dataUrl = await toPng(node, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: '#ffffff', // Clean white background for PDF document printability
    style: {
      color: '#0f172a',
      padding: '16px',
    },
  });

  const img = await loadImageElement(dataUrl);
  const scale = Math.min(1, PDF_MAX_IMAGE_WIDTH_PX / img.width);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create canvas context for PDF export');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas;
}

/**
 * Generates and downloads a printable, compact, single-page PDF.
 *
 * - Embeds JPEG (not PNG) images so the file stays a few hundred KB instead of 14+ MB.
 * - Preserves the capture's aspect ratio instead of stretching it.
 * - Never splits the register: if the content is taller than A4, the page itself
 *   grows taller so everything stays on one continuous page.
 */
export async function exportToPDF(
  elementId: string,
  filename: string,
  _record?: AttendanceRecord
): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element with id '${elementId}' not found`);
    return false;
  }

  try {
    const canvas = await captureNodeForPDF(node);

    // A4 landscape reference size (297mm x 210mm)
    const a4LandscapeWidth = 297;
    const a4LandscapeHeight = 210;
    const usableWidth = a4LandscapeWidth - PDF_MARGIN_MM * 2;

    // Millimetres per canvas pixel, derived from width so the aspect ratio is kept
    const mmPerPx = usableWidth / canvas.width;
    const imageHeightMm = canvas.height * mmPerPx;

    // Grow the page height when the register is taller than A4 instead of
    // shrinking or splitting it. Width always stays A4-landscape sized.
    const pageWidth = a4LandscapeWidth;
    const pageHeight = Math.max(
      a4LandscapeHeight,
      imageHeightMm + PDF_MARGIN_MM * 2
    );

    const pdf = new jsPDF({
      // jsPDF reorders custom formats based on orientation, so pick the one
      // that keeps the page width at 297mm and only the height growing.
      orientation: pageHeight > pageWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [pageWidth, pageHeight],
      compress: true,
    });

    const dataUrl = canvas.toDataURL('image/jpeg', PDF_JPEG_QUALITY);
    const yOffset = (pageHeight - imageHeightMm) / 2;

    pdf.addImage(
      dataUrl,
      'JPEG',
      PDF_MARGIN_MM,
      yOffset,
      usableWidth,
      imageHeightMm,
      undefined,
      'FAST'
    );

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
