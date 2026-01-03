
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RegistrationSubmission, User } from '../types';

export const generateRegistrationSlip = async (
    submission: RegistrationSubmission,
    registrarName: string,
    logoUrl: string
): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5' // The slip looks like a half-sheet or similar, landscape A5 fits well or just use A4 and draw on top half. Let's stick to A4 landscape for a proper slip feel, or A5. The image looks rectangular landscape.
    });

    // Load logo
    const getImageData = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Could not get canvas context');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
        });
    };

    try {
        const logoData = await getImageData(logoUrl);
        doc.addImage(logoData, 'PNG', 15, 10, 40, 15); // Adjust dimensions
    } catch (e) {
        console.warn('Could not load logo for PDF', e);
    }

    // Header Text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Proof of Registration Receipt', 80, 20);

    doc.text('NO: ______________', 160, 20);

    // Table Data
    const submissionDate = new Date(submission.submittedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const currentDate = new Date().toLocaleDateString('en-GB');

    // Prepare table body
    const bodyData = [
        [
            { content: 'Name', styles: { fontStyle: 'bold' } },
            submission.studentName.toUpperCase(),
            { content: 'LUCT Stud. ID', styles: { fontStyle: 'bold' } },
            submission.academicStudentId || submission.studentId
        ],
        [
            { content: 'Faculty', styles: { fontStyle: 'bold' } },
            { content: submission.faculty, colSpan: 3 }
        ],
        [
            { content: 'Programme', styles: { fontStyle: 'bold' } },
            { content: submission.program, colSpan: 3 }
        ],
        [
            { content: 'Class', styles: { fontStyle: 'bold' } },
            { content: submission.studentClass || `${submission.program} - Year ${submission.yearLevel || 1}`, colSpan: 3 }
        ],
        [
            { content: 'Date', styles: { fontStyle: 'bold' } },
            currentDate,
            { content: 'Signature', styles: { fontStyle: 'bold' } },
            '' // Space for signature
        ]
    ];

    autoTable(doc, {
        startY: 30,
        head: [],
        body: bodyData,
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            textColor: [0, 0, 0]
        },
        columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold' }, // Label column
            1: { cellWidth: 80 },
            2: { cellWidth: 30, fontStyle: 'bold' },
            3: { cellWidth: 'auto' }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const text = "The above-mentioned student has completed their registration process and has covered all the required areas. Kindly allow the student access into the campus till the student card is ready.";
    const textLines = doc.splitTextToSize(text, 180);
    doc.text(textLines, 15, finalY);

    // Footer / Signature Section
    const signatureY = finalY + 20;

    doc.text('(Registry Technician) Name: _________________', 15, signatureY);
    doc.setFont('courier', 'bold');
    doc.text(registrarName.toUpperCase(), 65, signatureY - 1); // Fill in the name

    doc.setFont('helvetica', 'normal');
    doc.text('Sign: _________________', 110, signatureY);
    // Fake signature
    doc.setFont('script', 'italic');
    // jsPDF doesn't have script font by default, stick to standard or import. 
    // Let's just put a "Signed" text in a different font or leave blank for real signature

    doc.setFont('helvetica', 'normal');
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${currentDate}`, 15, signatureY + 10);

    return doc.output('blob');
};
