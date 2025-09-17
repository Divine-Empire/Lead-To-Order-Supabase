import React from 'react';
import ReactDOMServer from 'react-dom/server';
import logo from '../../assests/WhatsApp Image 2025-05-14 at 4.11.43 PM.jpeg';
import maniquipLogo from '../../assests/banner.jpeg';

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
  minHeight: 'auto', // Changed from '297mm' to 'auto'
  fontFamily: 'Arial, sans-serif', 
  fontSize: '11px', 
  lineHeight: '1.3',
  margin: '0',
  padding: '5mm',
  backgroundColor: 'white',
  color: 'black',
  boxSizing: 'border-box'
}}>
      
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
      </div>

      {/* Main Content Area */}
      {/* <div style={{ border: '1px solid #000', padding: '20px' }}> */}
      <div style={{ 
  border: '1px solid #000', 
  padding: '20px',
  pageBreakInside: 'avoid', // Add this
  breakInside: 'avoid' // Add this for better browser support
}}>
        
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

        {/* ManiqQuip Logo in center - PROPERLY CENTERED */}
       <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '15px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src={maniquipLogo} 
            alt="ManiqQuip Logo" 
            style={{
              width: '500px',
              height: '200px',
              objectFit: 'contain',
              border: '1px solid #ddd',
              backgroundColor: '#f0f8ff',
              padding: '10px',
              margin: '0 auto'
            }}
          />
        </div>

        {/* Terms & Conditions and Bank Details - CLEAN LAYOUT */}
        <div style={{ 
  display: 'flex',
  marginBottom: '25px',
  gap: '25px',
  minHeight: 'auto', // Changed from '200px' to 'auto'
  pageBreakInside: 'avoid', // Add this
  breakInside: 'avoid' // Add this
}}>
          {/* Terms & Conditions */}
          <div style={{ 
            width: '48%',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#fafafa'
          }}>
            <h4 style={{ 
              margin: '0 0 15px 0', 
              fontSize: '13px', 
              fontWeight: 'bold',
              color: '#333',
              borderBottom: '2px solid #007bff',
              paddingBottom: '8px'
            }}>
              Terms & Conditions
            </h4>
            <div style={{ fontSize: '9px', lineHeight: '1.6' }}>
              {terms.map((term, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>{term.label}:</div>
                  <div style={{ color: '#666', paddingLeft: '5px' }}>{term.value}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bank Details and Declaration */}
          <div style={{ 
            width: '48%',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#fafafa'
          }}>
            <h4 style={{ 
              margin: '0 0 15px 0', 
              fontSize: '13px', 
              fontWeight: 'bold',
              color: '#333',
              borderBottom: '2px solid #28a745',
              paddingBottom: '8px'
            }}>
              Bank Details
            </h4>
            <div style={{ fontSize: '9px', lineHeight: '1.6', marginBottom: '20px' }}>
              {bankDetails.map((detail, index) => (
                <div key={index} style={{ marginBottom: '4px', display: 'flex' }}>
                  <span style={{ fontWeight: 'bold', color: '#555', minWidth: '80px' }}>{detail.label}:</span>
                  <span style={{ color: '#666', flex: '1' }}>{detail.value}</span>
                </div>
              ))}
            </div>
            
            <h4 style={{ 
              margin: '15px 0 8px 0', 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: '#333',
              borderBottom: '1px solid #ddd',
              paddingBottom: '5px'
            }}>
              Declaration:
            </h4>
            <p style={{ fontSize: '9px', lineHeight: '1.5', margin: '0 0 15px 0', color: '#666' }}>
              We declare that this Quotation shows the actual price of the goods described 
              and that all particulars are true and correct.
            </p>
            
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'right',
              borderTop: '1px solid #eee',
              paddingTop: '10px'
            }}>
              <p style={{ fontSize: '9px', margin: '0', fontWeight: 'bold', color: '#333' }}>
                Prepared By: {quotationData.preparedBy || "N/A"}
              </p>
            </div>
            
            <p style={{ 
              fontSize: '7px', 
              fontStyle: 'italic', 
              textAlign: 'center', 
              margin: '15px 0 0 0',
              color: '#999',
              borderTop: '1px solid #eee',
              paddingTop: '8px'
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
      line-height: 1.3;
    }
    @media print {
      body { margin: 0; }
      @page { 
        size: A4; 
        margin: 20mm 15mm 20mm 15mm; /* top right bottom left margins */
      }
      .page-break {
        page-break-before: always;
      }
      .avoid-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      thead {
        display: table-header-group;
      }
      tbody {
        display: table-row-group;
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
      // margin: 0,
      margin: [5, 0, 0, 0], // top, right, bottom, left margins in mm
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