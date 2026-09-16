import { format } from 'date-fns';

export async function exportToPDF(
    title: string, 
    filename: string, 
    headers: string[], 
    rows: (string | number)[][]
) {
    if (typeof window === 'undefined') return;

    try {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        
        // Brand Header
        doc.setFontSize(18);
        doc.setTextColor(79, 70, 229); // Indigo 600
        doc.text(`QRatten — ${title}`, 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 14, 28);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 34,
            theme: 'grid',
            headStyles: { 
                fillColor: [79, 70, 229], 
                textColor: [255, 255, 255], 
                fontStyle: 'bold' 
            },
            alternateRowStyles: { 
                fillColor: [248, 250, 252] 
            },
            styles: {
                fontSize: 9,
                cellPadding: 4
            }
        });

        doc.save(filename);
    } catch (err) {
        console.error('PDF generation error:', err);
        throw err;
    }
}
