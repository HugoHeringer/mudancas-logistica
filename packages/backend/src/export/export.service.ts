import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

@Injectable()
export class ExportService {
  gerarExcel(dados: any[], colunas: { header: string; key: string }[], nomeFicheiro: string): Buffer {
    const rows = dados.map((row) => {
      const obj: Record<string, any> = {};
      for (const col of colunas) {
        obj[col.header] = this.resolveValue(row, col.key);
      }
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const colWidths = colunas.map((col) => ({
      wch: Math.max(
        col.header.length,
        ...rows.map((r) => String(r[col.header] ?? '').length),
      ) + 2,
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nomeFicheiro.slice(0, 31));

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  gerarCsv(dados: any[], colunas: { header: string; key: string }[]): string {
    const rows = dados.map((row) => {
      const obj: Record<string, any> = {};
      for (const col of colunas) {
        obj[col.header] = this.resolveValue(row, col.key);
      }
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    return XLSX.utils.sheet_to_csv(ws);
  }

  /**
   * Generate a PDF report with a title and data table.
   * Returns a Buffer containing the PDF file.
   */
  gerarPdf(
    dados: any[],
    colunas: { header: string; key: string }[],
    titulo: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(18).font('Helvetica-Bold').text(titulo, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica').text(`Gerado em ${new Date().toLocaleString('pt-PT')}`, { align: 'center' });
      doc.moveDown(1.5);

      // Table layout
      const pageWidth = doc.page.width - 80; // margins
      const colCount = colunas.length;
      const colWidth = pageWidth / colCount;
      const rowHeight = 22;
      const headerHeight = 26;
      let y = doc.y;

      const drawRow = (cells: string[], isHeader = false) => {
        // Check if we need a new page
        if (y + rowHeight > doc.page.height - 50) {
          doc.addPage();
          y = 40;
        }

        const font = isHeader ? 'Helvetica-Bold' : 'Helvetica';
        const fontSize = isHeader ? 8 : 7.5;
        const bgFill = isHeader ? '#D4A853' : undefined;

        if (bgFill) {
          doc.save();
          doc.rect(40, y, pageWidth, headerHeight).fill(bgFill);
          doc.restore();
        }

        let x = 40;
        for (let i = 0; i < cells.length; i++) {
          doc.font(font).fontSize(fontSize);
          const textColor = isHeader ? '#FFFFFF' : '#2C1810';
          doc.fillColor(textColor).text(
            String(cells[i] ?? '').slice(0, 40),
            x + 4,
            y + (isHeader ? 7 : 6),
            { width: colWidth - 8, height: rowHeight, ellipsis: true },
          );
          x += colWidth;
        }

        // Bottom line
        doc.save();
        doc.moveTo(40, y + (isHeader ? headerHeight : rowHeight))
          .lineTo(40 + pageWidth, y + (isHeader ? headerHeight : rowHeight))
          .strokeColor('#E0D5C1')
          .lineWidth(0.5)
          .stroke();
        doc.restore();

        y += isHeader ? headerHeight : rowHeight;
      };

      // Header row
      drawRow(colunas.map((c) => c.header), true);

      // Data rows
      for (const row of dados) {
        const cells = colunas.map((col) => {
          const val = this.resolveValue(row, col.key);
          return val !== null && val !== undefined ? String(val) : '';
        });
        drawRow(cells);
      }

      // Summary line
      y += 10;
      if (y < doc.page.height - 60) {
        doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
          .text(`Total de registos: ${dados.length}`, 40, y);
      }

      doc.end();
    });
  }

  private resolveValue(obj: any, path: string): any {
    return path.split('.').reduce((o, k) => o?.[k], obj) ?? '';
  }
}
