// import jsPDF from "jspdf"
// import autoTable from "jspdf-autotable"

// export const generatePDFFromData = (quotationData, selectedReferences, specialDiscount) => {
//   // Change orientation to 'landscape'
//   const doc = new jsPDF("l", "mm", "a4") // 'l' for landscape

//   const pageWidth = 297 // A4 Landscape width
//   const pageHeight = 210 // A4 Landscape height
//   const margin = 15 // Adjusted margin for landscape
//   let currentY = 15 // Adjusted starting Y for landscape

//   // Professional color palette - Refined for a cleaner look
//   const colors = {
//     primary: [28, 48, 80], // Dark Blue (more professional)
//     secondary: [90, 120, 150], // Muted Blue
//     accent: [200, 50, 50], // Muted Red for highlights
//     success: [40, 140, 80], // Pleasant Green
//     background: {
//       light: [250, 250, 250], // Off-White
//       blue: [235, 245, 255], // Very Light Blue
//       green: [240, 255, 240], // Very Light Green
//       yellow: [255, 255, 220], // Pale Yellow
//     },
//     text: {
//       primary: [40, 40, 40], // Dark Gray
//       secondary: [90, 90, 90], // Medium Gray
//       muted: [150, 150, 150], // Light Gray
//     },
//     border: {
//       primary: [180, 180, 180], // Medium Light Gray
//       secondary: [220, 220, 220], // Very Light Gray
//       accent: [150, 180, 210], // Light Steel Blue
//     }
//   }

//   const wrapText = (text, maxWidth) => {
//     return doc.splitTextToSize(text || "", maxWidth)
//   }

//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })
//       .format(value)
//       .replace("₹", "")
//       .trim()
//   }

//   const checkSpace = (requiredHeight) => {
//     if (currentY + requiredHeight > pageHeight - margin - 20) {
//       doc.addPage()
//       currentY = margin + 10 // Reset Y for new page in landscape
//       return true
//     }
//     return false
//   }

//   const addDecorative = () => {
//     doc.setFillColor(...colors.primary)
//     doc.rect(0, 0, pageWidth, 5, "F")
//     doc.setFillColor(...colors.accent)
//     doc.rect(0, 5, pageWidth, 2, "F")
//   }

//   const addPageHeader = () => {
//     addDecorative()

//     currentY = margin + 5

//     doc.setFillColor(...colors.accent)
//     doc.rect(margin, currentY, 15, 15, "F")
//     doc.setTextColor(255, 255, 255)
//     doc.setFontSize(10)
//     doc.setFont("helvetica", "bold")
//     doc.text("DE", margin + 7.5, currentY + 9, { align: "center" })

//     doc.setTextColor(...colors.primary)
//     doc.setFontSize(24)
//     doc.setFont("helvetica", "bold")
//     doc.text("DIVINE EMPIRE INDIA PVT. LTD.", pageWidth / 2, currentY + 5, { align: "center" })

//     doc.setFontSize(10)
//     doc.setTextColor(...colors.text.secondary)
//     doc.setFont("helvetica", "normal")
//     doc.text("Professional Business Solutions", pageWidth / 2, currentY + 13, { align: "center" })

//     currentY += 25

//     doc.setFillColor(...colors.background.blue)
//     doc.setDrawColor(...colors.border.accent)
//     doc.setLineWidth(0.5)
//     doc.rect(margin, currentY, pageWidth - 2 * margin, 10, "F")
//     doc.rect(margin, currentY, pageWidth - 2 * margin, 10)

//     doc.setFont("helvetica", "bold")
//     doc.setFontSize(11)
//     doc.setTextColor(...colors.primary)
//     doc.text(`Quotation No: ${quotationData.quotationNo}`, margin + 5, currentY + 6)
//     doc.text(`Date: ${quotationData.date}`, pageWidth - margin - 5, currentY + 6, { align: "right" })

//     currentY += 18
//   }

//   addPageHeader()

//   // Fixed consignor/consignee details with proper height calculation
//   const consignorDetails = [
//     `Name: ${selectedReferences[0] || "N/A"}`,
//     `Address: ${quotationData.consignorAddress}`,
//     `Mobile: ${quotationData.consignorMobile?.split(",")[0] || "N/A"}`,
//     `GSTIN: ${quotationData.consignorGSTIN || "N/A"}`,
//     `State Code: ${quotationData.consignorStateCode || "N/A"}`,
//   ]

//   const consigneeDetails = [
//     `Name: ${quotationData.consigneeName}`,
//     `Address: ${quotationData.consigneeAddress}`,
//     `Contact: ${quotationData.consigneeContactName || "N/A"}`,
//     `Mobile: ${quotationData.consigneeContactNo || "N/A"}`,
//     `GSTIN: ${quotationData.consigneeGSTIN || "N/A"}`,
//     `State Code: ${quotationData.consigneeStateCode || "N/A"}`,
//   ]

//   const boxWidth = (pageWidth - 3 * margin) / 2
//   const cardPadding = 6
//   const lineHeight = 4.5

//   // Calculate required height for each box
//   const calculateBoxHeight = (details) => {
//     let totalHeight = 8 + 8 + cardPadding // Header + top padding + bottom padding
//     details.forEach(line => {
//       const wrappedLines = wrapText(line, boxWidth - 2 * cardPadding)
//       totalHeight += wrappedLines.length * lineHeight
//     })
//     return Math.max(totalHeight, 50) // Minimum height of 50mm
//   }

//   const consignorHeight = calculateBoxHeight(consignorDetails)
//   const consigneeHeight = calculateBoxHeight(consigneeDetails)
//   const boxHeight = Math.max(consignorHeight, consigneeHeight) // Use same height for both boxes

//   // Draw consignor box
//   doc.setFillColor(...colors.background.light)
//   doc.setDrawColor(...colors.border.primary)
//   doc.setLineWidth(0.6)
//   doc.rect(margin, currentY, boxWidth, boxHeight, "FD")

//   // Draw consignee box
//   doc.rect(margin + boxWidth + margin, currentY, boxWidth, boxHeight, "FD")

//   // Draw headers
//   doc.setFillColor(...colors.primary)
//   doc.rect(margin, currentY, boxWidth, 8, "F")
//   doc.rect(margin + boxWidth + margin, currentY, boxWidth, 8, "F")

//   doc.setFont("helvetica", "bold")
//   doc.setFontSize(10)
//   doc.setTextColor(255, 255, 255)
//   doc.text("FROM (CONSIGNOR)", margin + boxWidth/2, currentY + 5, { align: "center" })
//   doc.text("TO (CONSIGNEE)", margin + boxWidth + margin + boxWidth/2, currentY + 5, { align: "center" })

//   // Add consignor details
//   doc.setFont("helvetica", "normal")
//   doc.setFontSize(8.5)
//   doc.setTextColor(...colors.text.primary)

//   let consignorY = currentY + 8 + cardPadding
//   consignorDetails.forEach((line) => {
//     const wrappedLines = wrapText(line, boxWidth - 2 * cardPadding)
//     wrappedLines.forEach((wrappedLine) => {
//       doc.text(wrappedLine, margin + cardPadding, consignorY)
//       consignorY += lineHeight
//     })
//   })

//   // Add consignee details
//   let consigneeY = currentY + 8 + cardPadding
//   consigneeDetails.forEach((line) => {
//     const wrappedLines = wrapText(line, boxWidth - 2 * cardPadding)
//     wrappedLines.forEach((wrappedLine) => {
//       doc.text(wrappedLine, margin + boxWidth + margin + cardPadding, consigneeY)
//       consigneeY += lineHeight
//     })
//   })

//   currentY += boxHeight + 15

//   const itemsData = quotationData.items.map((item, index) => [
//     index + 1,
//     item.code,
//     item.name,
//     item.description,
//     `${item.gst}%`,
//     item.qty,
//     item.units,
//     formatCurrency(item.rate),
//     `${item.discount}%`,
//     formatCurrency(item.flatDiscount),
//     formatCurrency(item.amount),
//   ])

//   doc.setFillColor(...colors.background.blue)
//   doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 10, "F")
//   doc.setDrawColor(...colors.border.accent)
//   doc.setLineWidth(0.5)
//   doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 10)

//   doc.setFont("helvetica", "bold")
//   doc.setFontSize(12)
//   doc.setTextColor(...colors.primary)
//   doc.text("ITEM DETAILS", margin + 5, currentY + 1)

//   currentY += 8

//   // Calculate available width for the table
//   const availableTableWidth = pageWidth - 2 * margin;
//   // Distribute column widths to fit perfectly in landscape
//   // Total width: 297mm - 2*15mm = 267mm

//   autoTable(doc, {
//     startY: currentY,
//     head: [["S.No", "Code", "Product Name", "Description", "GST %", "Qty", "Units", "Rate", "Disc %", "Flat Disc", "Amount"]],
//     body: itemsData,
//     margin: { left: margin, right: margin },
//     styles: {
//       fontSize: 8,
//       cellPadding: 3,
//       overflow: 'linebreak',
//       lineColor: colors.border.secondary,
//       lineWidth: 0.3,
//       textColor: colors.text.primary,
//       font: 'helvetica',
//     },
//     headStyles: {
//       fillColor: colors.primary,
//       textColor: [255, 255, 255],
//       fontSize: 9,
//       fontStyle: 'bold',
//       cellPadding: 4,
//       halign: 'center',
//       valign: 'middle',
//     },
//     alternateRowStyles: {
//       fillColor: colors.background.light,
//     },
//     columnStyles: {
//       0: { cellWidth: 'auto', halign: 'center' }, // S.No
//       1: { cellWidth: 'auto', halign: 'center' }, // Code
//       2: { cellWidth: 'auto', fontStyle: 'bold' }, // Product Name
//       3: { cellWidth: 'auto' }, // Description (largest)
//       4: { cellWidth: 'auto', halign: 'center' }, // GST %
//       5: { cellWidth: 'auto', halign: 'center' }, // Qty
//       6: { cellWidth: 'auto', halign: 'center' }, // Units
//       7: { cellWidth: 'auto', halign: 'right' }, // Rate
//       8: { cellWidth: 'auto', halign: 'center' }, // Disc %
//       9: { cellWidth: 'auto', halign: 'right' }, // Flat Disc
//       10: {
//         cellWidth: 'auto', // Amount
//         halign: 'right',
//         fontStyle: 'bold',
//         fillColor: colors.background.green,
//         textColor: colors.success,
//       },
//     },
//     didParseCell: function(data) {
//       // Center-align header text for specific columns if needed (already in headStyles)
//     },
//     didDrawPage: (data) => {
//       currentY = data.cursor.y;
//     },
//   });
  

//   currentY = doc.lastAutoTable.finalY + 15

//   checkSpace(80)

//   const summaryBoxWidth = 80
//   const summaryBoxHeight = 60
//   const summaryX = pageWidth - margin - summaryBoxWidth

//   doc.setFillColor(...colors.background.light)
//   doc.setDrawColor(...colors.border.primary)
//   doc.setLineWidth(0.8)
//   doc.rect(summaryX, currentY, summaryBoxWidth, summaryBoxHeight, "FD")

//   doc.setFillColor(...colors.primary)
//   doc.rect(summaryX, currentY, summaryBoxWidth, 8, "F")
//   doc.setTextColor(255, 255, 255)
//   doc.setFont("helvetica", "bold")
//   doc.setFontSize(10)
//   doc.text("FINANCIAL SUMMARY", summaryX + summaryBoxWidth / 2, currentY + 5, { align: "center" })

//   const summaryItems = [
//     { label: "Subtotal:", value: formatCurrency(quotationData.subtotal), color: colors.text.primary },
//     { label: "Total Flat Discount:", value: `-${formatCurrency(quotationData.totalFlatDiscount)}`, color: colors.accent },
//     { label: "Taxable Amount:", value: formatCurrency(quotationData.subtotal - quotationData.totalFlatDiscount), color: colors.text.primary },
//   ]

//   if (quotationData.isIGST) {
//     summaryItems.push({
//       label: `IGST (${quotationData.igstRate}%):`,
//       value: formatCurrency(quotationData.igstAmount),
//       color: colors.secondary
//     })
//   } else {
//     summaryItems.push({
//       label: `CGST (${quotationData.cgstRate}%):`,
//       value: formatCurrency(quotationData.cgstAmount),
//       color: colors.secondary
//     })
//     summaryItems.push({
//       label: `SGST (${quotationData.sgstRate}%):`,
//       value: formatCurrency(quotationData.sgstAmount),
//       color: colors.secondary
//     })
//   }

//   summaryItems.push({
//     label: "TOTAL AMOUNT:",
//     value: formatCurrency(quotationData.total),
//     color: colors.success,
//     bold: true
//   })

//   doc.setFont("helvetica", "normal")
//   doc.setFontSize(8.5)
//   let summaryY = currentY + 12

//   summaryItems.forEach((item, index) => {
//     if (item.bold || index === summaryItems.length - 1) {
//       doc.setFont("helvetica", "bold")
//       doc.setFontSize(9.5)
//       doc.setFillColor(...colors.background.green)
//       doc.rect(summaryX + 2, summaryY - 3, summaryBoxWidth - 4, 7, "F")
//     } else {
//       doc.setFont("helvetica", "normal")
//       doc.setFontSize(8.5)
//     }

//     doc.setTextColor(...item.color)
//     doc.text(item.label, summaryX + 4, summaryY)
//     doc.text(item.value, summaryX + summaryBoxWidth - 4, summaryY, { align: "right" })
//     summaryY += 6.5
//   })

//   currentY = Math.max(currentY + summaryBoxHeight + 10, summaryY + 10)

//   const addSectionHeader = (title, icon = "■") => {
//     doc.setFillColor(...colors.background.blue)
//     doc.rect(margin, currentY - 3, pageWidth - 2 * margin, 8, "F")
//     doc.setDrawColor(...colors.border.accent)
//     doc.setLineWidth(0.4)
//     doc.rect(margin, currentY - 3, pageWidth - 2 * margin, 8)

//     doc.setFont("helvetica", "bold")
//     doc.setFontSize(10)
//     doc.setTextColor(...colors.primary)
//     doc.text(`${icon} ${title}`, margin + 5, currentY + 2)

//     doc.setFont("helvetica", "normal")
//     doc.setFontSize(8.5)
//     doc.setTextColor(...colors.text.secondary)
//     currentY += 12
//   }

//   addSectionHeader("TERMS & CONDITIONS", "")

//   doc.setFillColor(...colors.background.light)
//   // Add proper spacing after the section header
//   const termsContentY = currentY + 3 // Added 3mm space from the section header
//   let maxTermsHeight = 0

//   const terms = [
//     { label: "Validity", value: quotationData.validity },
//     { label: "Payment Terms", value: quotationData.paymentTerms },
//     { label: "Delivery", value: quotationData.delivery },
//     { label: "Freight", value: quotationData.freight },
//     { label: "Insurance", value: quotationData.insurance },
//     { label: "Taxes", value: quotationData.taxes },
//   ]

//   // Reset currentY to termsContentY + padding for content
//   currentY = termsContentY + 4 // 4mm padding from top border

//   terms.forEach((term) => {
//     doc.setTextColor(...colors.text.primary)
//     doc.setFont("helvetica", "normal")
//     const text = `${term.label}: ${term.value}`
//     const wrappedLines = wrapText(text, pageWidth - 2 * margin - 20)
//     wrappedLines.forEach((line) => {
//       doc.text(line, margin + 10, currentY)
//       currentY += 4.5
//     })
//     maxTermsHeight = Math.max(maxTermsHeight, currentY - termsContentY)
//   })

//   // Draw the border around terms & conditions with proper spacing
//   doc.setDrawColor(...colors.border.secondary)
//   doc.setLineWidth(0.3)
//   doc.rect(margin + 5, termsContentY - 2, pageWidth - 2 * margin - 10, maxTermsHeight + 6, "S") // Added 6mm total padding (3 top + 3 bottom)

//   currentY += 5

//   if (quotationData.specialOffers && quotationData.specialOffers.filter((offer) => offer.trim()).length > 0) {
//     checkSpace(30)
//     addSectionHeader("DIVINE EMPIRE'S 10TH ANNIVERSARY SPECIAL OFFER", "")

//     doc.setFillColor(...colors.background.yellow)
//     const offersContentY = currentY
//     let maxOffersHeight = 0
//     quotationData.specialOffers
//       .filter((offer) => offer.trim())
//       .forEach((offer) => {
//         doc.setTextColor(...colors.accent)
//         doc.setFont("helvetica", "bold")
//         const text = `★ ${offer}`
//         const wrappedLines = wrapText(text, pageWidth - 2 * margin - 20)
//         wrappedLines.forEach((line) => {
//           doc.text(line, margin + 10, currentY)
//           currentY += 5
//         })
//         maxOffersHeight = Math.max(maxOffersHeight, currentY - offersContentY)
//       })

//     doc.setDrawColor(...colors.accent)
//     doc.setLineWidth(0.6)
//     doc.rect(margin + 5, offersContentY - 2, pageWidth - 2 * margin - 10, maxOffersHeight + 4, "S")

//     currentY += 5
//   }

//   if (quotationData.notes && quotationData.notes.length > 0) {
//     checkSpace(30)
//     addSectionHeader("ADDITIONAL NOTES", "")

//     doc.setFillColor(...colors.background.light)
//     const notesContentY = currentY
//     let maxNotesHeight = 0
//     quotationData.notes
//       .filter((note) => note.trim())
//       .forEach((note) => {
//         doc.setTextColor(...colors.text.primary)
//         doc.setFont("helvetica", "normal")
//         const text = `• ${note}`
//         const wrappedLines = wrapText(text, pageWidth - 2 * margin - 20)
//         wrappedLines.forEach((line) => {
//           doc.text(line, margin + 10, currentY)
//           currentY += 5
//         })
//         maxNotesHeight = Math.max(maxNotesHeight, currentY - notesContentY)
//       })

//     doc.setDrawColor(...colors.border.secondary)
//     doc.setLineWidth(0.3)
//     doc.rect(margin + 5, notesContentY - 2, pageWidth - 2 * margin - 10, maxNotesHeight + 4, "S")

//     currentY += 5
//   }

//   checkSpace(60)

//   addSectionHeader("BANK DETAILS", "")

//   doc.setFillColor(...colors.background.green)
//   // Add proper spacing after the section header
//   const bankContentY = currentY + 3 // Added 3mm space from the section header
//   let maxBankHeight = 0

//   const bankDetails = [
//     { label: "Account No.", value: quotationData.accountNo },
//     { label: "Bank Name", value: quotationData.bankName },
//     { label: "Bank Address", value: quotationData.bankAddress },
//     { label: "IFSC Code", value: quotationData.ifscCode },
//     { label: "Email", value: quotationData.email },
//     { label: "Website", value: quotationData.website },
//     { label: "Company PAN", value: quotationData.pan },
//   ]

//   // Reset currentY to bankContentY + padding for content
//   currentY = bankContentY + 4 // 4mm padding from top border

//   bankDetails.forEach((detail) => {
//     doc.setTextColor(...colors.primary)
//     doc.setFont("helvetica", "bold")
//     doc.setFontSize(8)
//     doc.text(`${detail.label}:`, margin + 10, currentY)
//     doc.setTextColor(...colors.text.secondary)
//     doc.setFont("helvetica", "normal")
//     const wrappedValue = wrapText(detail.value, (pageWidth - 2 * margin - 20) * 0.7)
//     wrappedValue.forEach((line) => {
//         doc.text(line, margin + 50, currentY)
//         currentY += 4.5
//     })
//     maxBankHeight = Math.max(maxBankHeight, currentY - bankContentY)
//   })

//   // Draw the border around bank details with proper spacing
//   doc.setDrawColor(...colors.success)
//   doc.setLineWidth(0.5)
//   doc.rect(margin + 5, bankContentY - 2, pageWidth - 2 * margin - 10, maxBankHeight + 6, "S") // Added 6mm total padding (3 top + 3 bottom)

//   currentY += 10
//   checkSpace(50)

//   addSectionHeader("DECLARATION", "")

//   doc.setFillColor(255, 255, 255)
//   // Add proper spacing after the section header
//   const declarationContentY = currentY + 3 // Added 3mm space from the section header
//   let maxDeclarationHeight = 0
//   const declaration = [
//     "We declare that this Quotation shows the actual price of the goods described",
//     "and that all particulars are true and correct.",
//   ]

//   // Reset currentY to declarationContentY + padding for content
//   currentY = declarationContentY + 4 // 4mm padding from top border

//   doc.setTextColor(...colors.text.primary)
//   doc.setFont("helvetica", "normal")
//   declaration.forEach((line) => {
//     const wrappedLines = wrapText(line, pageWidth - 2 * margin - 20)
//     wrappedLines.forEach((wrappedLine) => {
//         doc.text(wrappedLine, margin + 10, currentY)
//         currentY += 5
//     })
//     maxDeclarationHeight = Math.max(maxDeclarationHeight, currentY - declarationContentY)
//   })

//   // Draw the border around declaration with proper spacing
//   doc.setDrawColor(...colors.border.primary)
//   doc.setLineWidth(0.5)
//   doc.rect(margin + 5, declarationContentY - 2, pageWidth - 2 * margin - 10, maxDeclarationHeight + 6, "S") // Added 6mm total padding (3 top + 3 bottom)

//   currentY += 15

//   doc.setFillColor(...colors.background.blue)
//   doc.setDrawColor(...colors.border.accent)
//   doc.setLineWidth(0.8)
//   doc.rect(margin, currentY, pageWidth - 2 * margin, 20, "FD")

//   doc.setDrawColor(...colors.text.muted)
//   doc.setLineWidth(0.4)
//   doc.line(pageWidth - margin - 80, currentY + 12, pageWidth - margin - 10, currentY + 12)

//   doc.setFont("helvetica", "bold")
//   doc.setFontSize(10)
//   doc.setTextColor(...colors.primary)
//   doc.text(`Prepared By: ${quotationData.preparedBy}`, margin + 10, currentY + 8)

//   doc.setFont("helvetica", "normal")
//   doc.setFontSize(8.5)
//   doc.setTextColor(...colors.text.secondary)
//   doc.text("Authorized Signatory", pageWidth - margin - 45, currentY + 16, { align: "center" })

//   const pageCount = doc.internal.getNumberOfPages()
//   for (let i = 1; i <= pageCount; i++) {
//     doc.setPage(i)

//     doc.setFillColor(...colors.background.light)
//     doc.rect(0, pageHeight - 15, pageWidth, 15, "F") // Adjusted footer height for landscape

//     doc.setDrawColor(...colors.border.secondary)
//     doc.setLineWidth(0.3)
//     doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

//     doc.setFontSize(7.5)
//     doc.setTextColor(...colors.text.muted)
//     doc.setFont("helvetica", "normal")

//     doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: "right" })

//     doc.text("Generated by Divine Empire Professional Quotation System", margin, pageHeight - 10)
//     doc.text("This is a computer-generated document", margin, pageHeight - 4)

//     const now = new Date()
//     doc.text(`Generated on: ${now.toLocaleString()}`, pageWidth - margin, pageHeight - 10, { align: "right" })
//   }

//   return doc.output("datauristring").split(",")[1]
// }







import React from 'react';
import ReactDOMServer from 'react-dom/server';
import logo from '../../assests/WhatsApp Image 2025-05-14 at 4.11.43 PM.jpeg';
import maniquipLogo from '../../assests/WhatsApp Image 2025-05-14 at 4.11.54 PM.jpeg';

// React PDF Component that matches your web interface exactly
const QuotationPDFComponent = ({ quotationData, selectedReferences, specialDiscount, hiddenColumns = {} }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value || 0)
      .replace("₹", "")
      .trim();
  };

  const consignorDetails = [
    String(selectedReferences && selectedReferences[0] ? selectedReferences[0] : "NEERAJ SIR"),
    `Plot no 27, PATRAPADA Bhagabanpur Industrial Estate`,
    `PATRAPADA, PS - TAMANDO, Bhubaneswar, Odisha 751019`,
    `State: ${String(quotationData.consignorState || "Odisha")}`,
    `Mobile: ${String(quotationData.consignorMobile && typeof quotationData.consignorMobile === 'string' ? quotationData.consignorMobile.split(",")[0] : quotationData.consignorMobile || "7024425225")}`,
    `Phone: ${String(quotationData.consignorPhone || "N/A")}`,
    `GSTIN: ${String(quotationData.consignorGSTIN || "21AAGCD9326H1ZS")}`,
    `State Code: ${String(quotationData.consignorStateCode || "21")}`,
  ];

  const consigneeDetails = [
    `Company Name: ${String(quotationData.consigneeName || "N/A")}`,
    `Contact Name: ${String(quotationData.consigneeContactName || "N/A")}`,
    `Contact No.: ${String(quotationData.consigneeContactNo || "N/A")}`,
    `State: ${String(quotationData.consigneeState || "N/A")}`,
    `GSTIN: ${String(quotationData.consigneeGSTIN || "N/A")}`,
    `State Code: ${String(quotationData.consigneeStateCode || "N/A")}`,
  ];

  const terms = [
    { label: "Validity", value: quotationData.validity || "The above quoted prices are valid up to 5 days from date of offer." },
    { label: "Payment Terms", value: quotationData.paymentTerms || "100% advance payment in the mode of NEFT, RTGS & DD" },
    { label: "Delivery", value: quotationData.delivery || "Material is ready in our stock" },
    { label: "Freight", value: quotationData.freight || "Extra as per actual." },
    { label: "Insurance", value: quotationData.insurance || "Transit insurance for all shipment is at Buyer's risk." },
    { label: "Taxes", value: quotationData.taxes || "Extra as per actual." },
  ];

  const bankDetails = [
    { label: "Account No.", value: String(quotationData.accountNo || "N/A") },
    { label: "Bank Name", value: String(quotationData.bankName || "N/A") },
    { label: "Bank Address", value: String(quotationData.bankAddress || "N/A") },
    { label: "IFSC CODE", value: String(quotationData.ifscCode || "N/A") },
    { label: "Email", value: String(quotationData.email || "N/A") },
    { label: "Website", value: String(quotationData.website || "N/A") },
    { label: "Company PAN", value: String(quotationData.pan || "N/A") },
  ];

  // Build table headers based on hidden columns
  const tableHeaders = ["S No.", "Code", "Product Name", "Description", "GST %", "Qty", "Units", "Rate"];
  if (!hiddenColumns.hideDisc) tableHeaders.push("Disc %");
  if (!hiddenColumns.hideFlatDisc) tableHeaders.push("Flat Disc");
  tableHeaders.push("Amount");

  // Build items data
  const itemsData = quotationData.items ? quotationData.items.map((item, index) => {
    const row = [
      String(index + 1),
      String(item.code || "N/A"),
      String(item.name || "N/A"),
      String(item.description || "N/A"),
      String(`${item.gst || 18}%`),
      String(item.qty || 1),
      String(item.units || "Nos"),
      `₹${formatCurrency(item.rate || 0)}`,
    ];
    if (!hiddenColumns.hideDisc) row.push(String(`${item.discount || 0}%`));
    if (!hiddenColumns.hideFlatDisc) row.push(`₹${formatCurrency(item.flatDiscount || 0)}`);
    row.push(`₹${formatCurrency(item.amount || 0)}`);
    return row;
  }) : [
    (() => {
      const defaultRow = [
        "1", 
        "N/A", 
        "N/A",
        "N/A",
        "18%", 
        "1", 
        "Nos", 
        "₹0.00"
      ];
      if (!hiddenColumns.hideDisc) defaultRow.push("0%");
      if (!hiddenColumns.hideFlatDisc) defaultRow.push("₹0.00");
      defaultRow.push("₹0.00");
      return defaultRow;
    })()
  ];

  // Financial calculations
  const subtotal = quotationData.subtotal || 0;
  const totalFlatDiscount = quotationData.totalFlatDiscount || 0;
  const taxableAmount = Math.max(0, subtotal - totalFlatDiscount);
  
  const cgstRate = quotationData.cgstRate || 9;
  const sgstRate = quotationData.sgstRate || 9;
  const cgstAmount = quotationData.cgstAmount || (taxableAmount * (cgstRate / 100));
  const sgstAmount = quotationData.sgstAmount || (taxableAmount * (sgstRate / 100));
  const totalTax = cgstAmount + sgstAmount;
  const grandTotal = taxableAmount + totalTax - (specialDiscount || 0);

  const dateStr = quotationData.date ? new Date(quotationData.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

  return (
    <div style={{ 
      width: '210mm', 
      minHeight: '297mm', 
      fontFamily: 'Arial, sans-serif', 
      fontSize: '11px', 
      lineHeight: '1.3',
      margin: '0',
      padding: '15mm',
      backgroundColor: 'white',
      color: 'black',
      boxSizing: 'border-box'
    }}>
      
      {/* Header Section */}
      {/* Header Section */}
<div style={{ 
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '15px',
  borderBottom: '1px solid #000',
  position: 'relative'
}}>
  {/* Logo (Left Side) */}
  <div style={{ width: '60px', height: '60px' }}>
    <img 
      src={logo} 
      alt="Company Logo" 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
    />
  </div>

  {/* Company Name (Centered) */}
  <div style={{ 
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center'
  }}>
    <h1 style={{ 
      fontSize: '24px', 
      fontWeight: 'bold', 
      color: '#8b5cf6',
      margin: '0',
      lineHeight: '1.2'
    }}>
      DIVINE EMPIRE INDIA PVT. LTD.
    </h1>
  </div>
        
        {/* Revise Button Placeholder */}
        {/* <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Revise
        </div> */}
      </div>

      {/* Main Content Area */}
      <div style={{ border: '1px solid #000', padding: '20px' }}>
        
        {/* Quotation Header */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          {/* Consignor Name Section */}
          <div>
            <h3 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>Consignor Name</h3>
            <p style={{ margin: '2px 0', fontSize: '12px' }}>Consignor Address</p>
            <p style={{ margin: '2px 0', fontSize: '12px' }}>Mobile: N/A</p>
            <p style={{ margin: '2px 0', fontSize: '12px' }}>Phone: N/A</p>
            <p style={{ margin: '2px 0', fontSize: '12px' }}>GSTIN: N/A</p>
            <p style={{ margin: '2px 0', fontSize: '12px' }}>State Code: N/A</p>
          </div>
          
          {/* Quotation Info */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              margin: '0',
              marginBottom: '10px'
            }}>QUOTATION</h2>
          </div>
          
          {/* Quotation Details */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '2px 0', fontSize: '12px' }}>Quo No: {quotationData.quotationNo || "NBD-002"}</p>
            <p style={{ margin: '2px 0', fontSize: '12px' }}>Date: {dateStr}</p>
            <p style={{ margin: '2px 0', fontSize: '12px' }}>Prepared By: {quotationData.preparedBy || "N/A"}</p>
          </div>
        </div>

        {/* Consignor and Consignee Details */}
        <div style={{ 
          display: 'flex',
          marginBottom: '20px',
          borderTop: '1px solid #000',
          borderBottom: '1px solid #000'
        }}>
          {/* Consignor Details */}
          <div style={{ 
            width: '50%',
            borderRight: '1px solid #000',
            padding: '10px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>Consignor Details</h4>
            <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
              {consignorDetails.map((detail, index) => (
                <div key={index} style={{ marginBottom: '2px' }}>{detail}</div>
              ))}
            </div>
          </div>
          
          {/* Consignee Details */}
          <div style={{ 
            width: '50%',
            padding: '10px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>Consignee Details</h4>
            <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
              {consigneeDetails.map((detail, index) => (
                <div key={index} style={{ marginBottom: '2px' }}>{detail}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Bill To and Ship To */}
        <div style={{ 
          display: 'flex',
          marginBottom: '20px',
          borderBottom: '1px solid #000'
        }}>
          {/* Bill To */}
          <div style={{ 
            width: '50%',
            borderRight: '1px solid #000',
            padding: '10px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>Bill To</h4>
            <p style={{ margin: '0', fontSize: '10px' }}>N/A</p>
          </div>
          
          {/* Ship To */}
          <div style={{ 
            width: '50%',
            padding: '10px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>Ship To</h4>
            <p style={{ margin: '0', fontSize: '10px' }}>N/A</p>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ 
          width: '100%', 
          border: '1px solid black', 
          borderCollapse: 'collapse',
          fontSize: '9px',
          marginBottom: '20px'
        }}>
          {/* Table Header */}
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              {tableHeaders.map((header, index) => (
                <th key={index} style={{ 
                  border: '1px solid black', 
                  padding: '5px 3px', 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '9px'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {itemsData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={{ 
                    border: '1px solid black', 
                    padding: '5px 3px', 
                    textAlign: cellIndex === 0 || cellIndex === 4 || cellIndex === 5 || cellIndex === 6 ? 'center' : 
                             cellIndex === 2 || cellIndex === 3 ? 'left' : 'right',
                    fontSize: '9px',
                    verticalAlign: 'middle'
                  }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Summary Rows */}
            <tr>
              <td colSpan={tableHeaders.length - 1} style={{ 
                border: '1px solid black', 
                padding: '5px', 
                textAlign: 'right',
                fontWeight: 'bold',
                fontSize: '9px'
              }}>
                Subtotal
              </td>
              <td style={{ 
                border: '1px solid black', 
                padding: '5px', 
                textAlign: 'right',
                fontWeight: 'bold',
                fontSize: '9px'
              }}>
                ₹{formatCurrency(subtotal)}
              </td>
            </tr>
            
            {!hiddenColumns.hideTotalFlatDisc && totalFlatDiscount > 0 && (
              <tr>
                <td colSpan={tableHeaders.length - 1} style={{ 
                  border: '1px solid black', 
                  padding: '5px', 
                  textAlign: 'right',
                  fontSize: '9px'
                }}>
                  Total Flat Discount
                </td>
                <td style={{ 
                  border: '1px solid black', 
                  padding: '5px', 
                  textAlign: 'right',
                  fontSize: '9px'
                }}>
                  -₹{formatCurrency(totalFlatDiscount)}
                </td>
              </tr>
            )}
            
            <tr>
              <td colSpan={tableHeaders.length - 1} style={{ 
                border: '1px solid black', 
                padding: '5px', 
                textAlign: 'right',
                fontSize: '9px'
              }}>
                Taxable Amount
              </td>
              <td style={{ 
                border: '1px solid black', 
                padding: '5px', 
                textAlign: 'right',
                fontSize: '9px'
              }}>
                ₹{formatCurrency(taxableAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tax Breakdown and Amount in Words */}
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          {/* Tax Breakdown */}
          <div style={{ width: '50%', marginRight: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>Tax Breakdown</h4>
            <table style={{ 
              width: '100%', 
              border: '1px solid black', 
              borderCollapse: 'collapse',
              fontSize: '10px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>Tax Type</th>
                  <th style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>Rate</th>
                  <th style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid black', padding: '5px' }}>CGST</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{cgstRate}%</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right' }}>₹{formatCurrency(cgstAmount)}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '5px' }}>SGST</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{sgstRate}%</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right' }}>₹{formatCurrency(sgstAmount)}</td>
                </tr>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>Total Tax</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>{cgstRate + sgstRate}%</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>₹{formatCurrency(totalTax)}</td>
                </tr>
                {!hiddenColumns.hideSpecialDiscount && specialDiscount > 0 && (
                  <tr>
                    <td style={{ border: '1px solid black', padding: '5px' }} colSpan="2">Special Discount</td>
                    <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right' }}>-₹{formatCurrency(specialDiscount)}</td>
                  </tr>
                )}
                <tr style={{ backgroundColor: '#e6f3ff' }}>
                  <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }} colSpan="2">Grand Total</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>₹{formatCurrency(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Amount in Words */}
          <div style={{ width: '50%' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>Amount Chargeable (in words)</h4>
            <p style={{ fontSize: '10px', margin: '0' }}>Rupees Zero Only</p>
            
            <div style={{ 
              marginTop: '20px',
              textAlign: 'right',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Grand Total: ₹{formatCurrency(grandTotal)}
            </div>
          </div>
        </div>

        {/* ManiqQuip Logo in center */}
     <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '20px 0'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#f0f8ff',
            padding: '15px 30px',
            borderRadius: '8px',
            border: '1px solid #e0e7ff'
          }}>
            <img 
              src={maniquipLogo} 
              alt="ManiqQuip Logo" 
              style={{
                width: '180px',
                height: '60px',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                backgroundColor: 'white'
              }}
              onError={(e) => {
                console.log('Image failed to load, using fallback');
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = `
                  <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 24px; font-weight: bold;">
                      <span style="color: #10b981;">Mani</span><span style="color: #2563eb;">Quip</span>
                    </div>
                  </div>
                `;
                e.target.parentNode.appendChild(fallback);
              }}
            />
          </div>
        </div>

        {/* Terms & Conditions and Bank Details */}
        <div style={{ 
          display: 'flex',
          marginBottom: '20px'
        }}>
          {/* Terms & Conditions */}
          <div style={{ 
            width: '50%',
            marginRight: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>Terms & Conditions</h4>
            <div style={{ fontSize: '9px', lineHeight: '1.4' }}>
              {terms.map((term, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>{term.label}:</span> {term.value}
                </div>
              ))}
            </div>
          </div>
          
          {/* Bank Details and Declaration */}
          <div style={{ 
            width: '50%'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>Bank Details</h4>
            <div style={{ fontSize: '9px', lineHeight: '1.4', marginBottom: '15px' }}>
              {bankDetails.map((detail, index) => (
                <div key={index} style={{ marginBottom: '2px' }}>
                  <span style={{ fontWeight: 'bold' }}>{detail.label}:</span> {detail.value}
                </div>
              ))}
            </div>
            
            <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>Declaration:</h4>
            <p style={{ fontSize: '9px', lineHeight: '1.3', margin: '0' }}>
              We declare that this Quotation shows the actual price of the goods described 
              and that all particulars are true and correct.
            </p>
            
            <div style={{ marginTop: '10px', textAlign: 'right' }}>
              <p style={{ fontSize: '9px', margin: '0' }}>Prepared By: {quotationData.preparedBy || "N/A"}</p>
            </div>
            
            <p style={{ 
              fontSize: '8px', 
              fontStyle: 'italic', 
              textAlign: 'center', 
              margin: '10px 0 0 0',
              color: '#666'
            }}>
              This Quotation is computer-generated and does not require a seal or signature.
            </p>
          </div>
        </div>

        {/* View as Client and Action Buttons */}
      </div>
    </div>
  );
};

// Function to generate HTML string from React component
export const generateHTMLFromData = (quotationData, selectedReferences, specialDiscount, hiddenColumns = {}) => {
  const htmlString = ReactDOMServer.renderToStaticMarkup(
    React.createElement(QuotationPDFComponent, {
      quotationData,
      selectedReferences,
      specialDiscount,
      hiddenColumns
    })
  );
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quotation ${quotationData.quotationNo || 'NBD-002'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    @media print {
      body { margin: 0; }
      @page { 
        size: A4; 
        margin: 0; 
      }
    }
    button {
      font-family: Arial, sans-serif;
    }
  </style>
</head>
<body>
  ${htmlString}
</body>
</html>`;
};

// Function to generate PDF using html2pdf library
export const generatePDFFromData = async (quotationData, selectedReferences, specialDiscount, hiddenColumns = {}) => {
  try {
    // Import html2pdf dynamically
    const html2pdf = (await import('html2pdf.js')).default;
    
    const htmlString = generateHTMLFromData(quotationData, selectedReferences, specialDiscount, hiddenColumns);
    
    const options = {
      margin: 0,
      filename: `Quotation_${quotationData.quotationNo || 'NBD-002'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    return html2pdf().set(options).from(htmlString).outputPdf('datauristring');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Alternative function that returns base64 directly (for compatibility)
export const generatePDFBase64 = async (quotationData, selectedReferences, specialDiscount, hiddenColumns = {}) => {
  try {
    const pdfDataUri = await generatePDFFromData(quotationData, selectedReferences, specialDiscount, hiddenColumns);
    const base64Data = pdfDataUri.split(',')[1];
    return base64Data;
  } catch (error) {
    console.error('Error generating PDF base64:', error);
    throw error;
  }
};

// Export the React component as well
export { QuotationPDFComponent };