
// import React from 'react';
// import ReactDOMServer from 'react-dom/server';
// import logo from '../../assests/WhatsApp Image 2025-05-14 at 4.11.43 PM.jpeg';
// import maniquipLogo from '../../assests/banner.jpeg';
// import qr from '../../assests/qrlogo.png';
// import maniquipLogo1 from "../../assests/Screenshot 2025-09-25 at 2.48.03 PM.png"

// // React PDF Component that matches your preview interface exactly
// const QuotationPDFComponent = ({ quotationData, selectedReferences, specialDiscount, hiddenColumns = {} }) => {
//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })
//       .format(value || 0)
//       .replace("₹", "")
//       .trim();
//   };

//   // Build table headers based on hidden columns
//   // const tableHeaders = ["S No.", "Code", "Product Name", "Description", "GST %", "Qty", "Units", "Rate"];

//   const tableHeaders = [
//   "S No.",
//   "Code",
//   "Product Name",
// ];
// if (!hiddenColumns.hideDescription) tableHeaders.push("Description");
// tableHeaders.push("GST %", "Qty", "Units", "Rate");


//   if (!hiddenColumns.hideDisc) tableHeaders.push("Disc %");
//   if (!hiddenColumns.hideFlatDisc) tableHeaders.push("Flat Disc");


//   tableHeaders.push("Amount");

//   // Build items data
//   const itemsData = quotationData.items ? quotationData.items.map((item, index) => {
//     // const row = [
//     //   String(index + 1),
//     //   String(item.code || "N/A"),
//     //   String(item.name || "N/A"),
//     //   String(item.description || "N/A"),
//     //   String(`${item.gst || 18}%`),
//     //   String(item.qty || 1),
//     //   String(item.units || "Nos"),
//     //   `₹${formatCurrency(item.rate || 0)}`,
//     // ];



//     const row = [
//   String(index + 1),
//   String(item.code || "N/A"),
//   String(item.name || "N/A"),
// ];
// if (!hiddenColumns.hideDescription) row.push(String(item.description || "N/A"));
// row.push(
//   String(`${item.gst || 18}%`),
//   String(item.qty || 1),
//   String(item.units || "Nos"),
//   `₹${formatCurrency(item.rate || 0)}`
// );

//     if (!hiddenColumns.hideDisc) row.push(String(`${item.discount || 0}%`));
//     if (!hiddenColumns.hideFlatDisc) row.push(`₹${formatCurrency(item.flatDiscount || 0)}`);
//     row.push(`₹${formatCurrency(item.amount || 0)}`);
//     return row;
//   }) : [
//     (() => {
//       // const defaultRow = [
//       //   "1", 
//       //   "N/A", 
//       //   "N/A",
//       //   "N/A",
//       //   "18%", 
//       //   "1", 
//       //   "Nos", 
//       //   "₹0.00"
//       // ];

//       const defaultRow = [
//   "1",
//   "N/A",
//   "N/A",
// ];
// if (!hiddenColumns.hideDescription) defaultRow.push("N/A");
// defaultRow.push("18%", "1", "Nos", "₹0.00");

//       if (!hiddenColumns.hideDisc) defaultRow.push("0%");
//       if (!hiddenColumns.hideFlatDisc) defaultRow.push("₹0.00");
//       defaultRow.push("₹0.00");
//       return defaultRow;
//     })()
//   ];

//   // Financial calculations
//   const subtotal = quotationData.subtotal || 0;
//   const totalFlatDiscount = quotationData.totalFlatDiscount || 0;
//   const taxableAmount = Math.max(0, subtotal - totalFlatDiscount);
  
//   const cgstRate = quotationData.cgstRate || 9;
//   const sgstRate = quotationData.sgstRate || 9;
//   const cgstAmount = quotationData.cgstAmount || (taxableAmount * (cgstRate / 100));
//   const sgstAmount = quotationData.sgstAmount || (taxableAmount * (sgstRate / 100));
//   const totalTax = cgstAmount + sgstAmount;
//   const grandTotal = taxableAmount + totalTax - (specialDiscount || 0);

//   const dateStr = quotationData.date ? new Date(quotationData.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

//   return (
//     <div style={{ 
//       width: '210mm', 
//       minHeight: 'auto',
//       fontFamily: 'Arial, sans-serif', 
//       fontSize: '12px', 
//       lineHeight: '1.4',
//       margin: '0',
//       padding: '20px',
//       backgroundColor: 'white',
//       color: 'black',
//       boxSizing: 'border-box',
//       position: 'relative'
//     }}>
      
//       {/* Fixed Bottom Corner Images for All Pages */}
//       <div style={{
//         position: 'fixed',
//         bottom: '10mm',
//         right: '10mm',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px',
//         zIndex: 1000,
//         backgroundColor: 'rgba(255, 255, 255, 0.9)',
//         padding: '5px',
//         borderRadius: '5px'
//       }}>
//         <img 
//           src={logo} 
//           alt="Company Logo" 
//           style={{ 
//             width: '40px', 
//             height: '40px', 
//             objectFit: 'contain' 
//           }} 
//         />
//         <img 
//           src={maniquipLogo1} 
//           alt="ManiQuip Logo" 
//           style={{ 
//             width: '60px', 
//             height: '40px', 
//             objectFit: 'contain' 
//           }} 
//         />
//       </div>
      
//       {/* Header Section with Company Logo - RESTORED */}
//       <div style={{ 
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '20px',
//         paddingBottom: '15px',
//         borderBottom: '1px solid #000',
//         position: 'relative',
//         pageBreakInside: 'avoid'
//       }}>
//         {/* Logo (Left Side) */}
//         <div style={{ width: '60px', height: '60px' }}>
//           <img 
//             src={logo} 
//             alt="Company Logo" 
//             style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
//           />
//         </div>

//         {/* Company Name (Centered) */}
//         <div style={{ 
//   position: 'absolute',
//   left: '50%',
//   transform: 'translateX(-50%)',
//   textAlign: 'center'
// }}>
//   <h1 style={{ 
//     fontSize: '24px', 
//     fontWeight: 'bold', 
//     color: '#113878ff',
//     margin: '0',
//     lineHeight: '1.2'
//   }}>
//     DIVINE EMPIRE INDIA
//   </h1>
//   <h2 style={{ 
//     fontSize: '20px', 
//     fontWeight: 'bold', 
//     color: '#113878ff',
//     margin: '0',
//     lineHeight: '1.2'
//   }}>
//     ( PVT. LTD. )
//   </h2>
// </div>

//  <div style={{ width: '140px', height: '100px' }}>
//           <img 
//             src={maniquipLogo1} 
//             alt="Company Logo" 
//             style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
//           />
//         </div>

//       </div>
      
//       {/* Main Content - Matches Preview Layout */}
//       <div style={{ 
//         border: '1px solid #ccc', 
//         padding: '24px',
//         borderRadius: '8px',
//         backgroundColor: '#fff',
//         pageBreakInside: 'avoid'
//       }}>
        
//         {/* Header Section - Simple layout like preview */}
//         <div style={{ 
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'flex-start',
//           marginBottom: '16px',
//           paddingBottom: '16px',
//           borderBottom: '1px solid #ddd'
//         }}>
//           <div style={{ width: '33%' }}>
//             <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>
//               {selectedReferences && selectedReferences[0] ? selectedReferences[0] : "Consignor Name"}
//             </p>
//             <p style={{ margin: '2px 0', fontSize: '12px' }}>
//               {quotationData.consignorAddress || "Consignor Address"}
//             </p>
//             <p style={{ margin: '2px 0', fontSize: '12px' }}>
//               Mobile: {quotationData.consignorMobile?.split(",")[0] || "N/A"}
//             </p>
//             <p style={{ margin: '2px 0', fontSize: '12px' }}>
//               Phone: {quotationData.consignorPhone || "N/A"}
//             </p>
//             <p style={{ margin: '2px 0', fontSize: '12px' }}>
//               GSTIN: {quotationData.consignorGSTIN || "N/A"}
//             </p>
//             <p style={{ margin: '2px 0', fontSize: '12px' }}>
//               State Code: {quotationData.consignorStateCode || "N/A"}
//             </p>
//           </div>
          
//           <div style={{ width: '33%', textAlign: 'center' }}>
//             <h1 style={{ 
//               fontSize: '20px', 
//               fontWeight: 'bold',
//               margin: '0',
//               color: '#333'
//             }}>QUOTATION</h1>
//           </div>
          
//           <div style={{ width: '33%', textAlign: 'right' }}>
//             <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: 'bold' }}>
//               Quo No: {quotationData.quotationNo || "NBD-002"}
//             </p>
//             <p style={{ margin: '2px 0', fontSize: '12px' }}>Date: {dateStr}</p>
//             <p style={{ margin: '2px 0', fontSize: '12px' }}>
//               Prepared By: {quotationData.preparedBy || "N/A"}
//             </p>
//           </div>
//         </div>

//         {/* Consignor and Consignee Details - Grid layout like preview */}
//         <div style={{ 
//           display: 'flex',
//           marginBottom: '16px',
//           gap: '16px'
//         }}>
//           <div style={{ width: '50%' }}>
//             <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
//               Consignor Details
//             </h3>
//             <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
//               <p style={{ margin: '2px 0' }}>{selectedReferences && selectedReferences[0] ? selectedReferences[0] : "N/A"}</p>
//               <p style={{ margin: '2px 0' }}>{quotationData.consignorAddress || "N/A"}</p>
//               <p style={{ margin: '2px 0' }}>GSTIN: {quotationData.consignorGSTIN || "N/A"}</p>
//               <p style={{ margin: '2px 0' }}>State Code: {quotationData.consignorStateCode || "N/A"}</p>
//               <p style={{ margin: '2px 0' }}>MSME Number: {quotationData.msmeNumber || "N/A"}</p>
//             </div>
//           </div>
          
//           <div style={{ width: '50%' }}>
//             <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
//               Consignee Details
//             </h3>
//             <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
//               <p style={{ margin: '2px 0' }}>Company Name: {quotationData.consigneeName || "N/A"}</p>
//               <p style={{ margin: '2px 0' }}>Contact Name: {quotationData.consigneeContactName || "N/A"}</p>
//               <p style={{ margin: '2px 0' }}>Contact No.: {quotationData.consigneeContactNo || "N/A"}</p>
//               <p style={{ margin: '2px 0' }}>State: {quotationData.consigneeState || "N/A"}</p>
//               <p style={{ margin: '2px 0' }}>GSTIN: {quotationData.consigneeGSTIN || "N/A"}</p>
//               <p style={{ margin: '2px 0' }}>State Code: {quotationData.consigneeStateCode || "N/A"}</p>
//             </div>
//           </div>
//         </div>

//         {/* Bill To and Ship To */}
//         <div style={{ 
//           display: 'flex',
//           marginBottom: '16px',
//           gap: '16px',
//           paddingBottom: '16px',
//           borderBottom: '1px solid #ddd'
//         }}>
//           <div style={{ width: '50%' }}>
//             <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Bill To</h3>
//             <p style={{ margin: '0', fontSize: '11px' }}>{quotationData.consigneeAddress || "N/A"}</p>
//           </div>
          
//           <div style={{ width: '50%' }}>
//             <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Ship To</h3>
//             <p style={{ margin: '0', fontSize: '11px' }}>{quotationData.shipTo || "N/A"}</p>
//           </div>
//         </div>

//         {/* Items Table - Clean design like preview */}
//         <div style={{ marginBottom: '16px' }}>
//           <table style={{ 
//             width: '100%', 
//             borderCollapse: 'collapse',
//             fontSize: '10px',
//             border: '1px solid #ccc'
//           }}>
//             <thead>
//               <tr style={{ backgroundColor: '#f8f9fa' }}>
//                 {tableHeaders.map((header, index) => (
//                   <th key={index} style={{ 
//                     border: '1px solid #ddd', 
//                     padding: '8px 4px', 
//                     textAlign: 'left',
//                     fontWeight: 'bold',
//                     fontSize: '10px'
//                   }}>
//                     {header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
            
//             <tbody>
//               {itemsData.map((row, rowIndex) => (
//                 <tr key={rowIndex} style={{ borderBottom: '1px solid #ddd' }}>
//                   {row.map((cell, cellIndex) => (
//                     <td key={cellIndex} style={{ 
//                       border: '1px solid #ddd', 
//                       padding: '8px 4px', 
//                       textAlign: cellIndex === 0 || cellIndex === 4 || cellIndex === 5 || cellIndex === 6 ? 'center' : 
//                                cellIndex === 2 || cellIndex === 3 ? 'left' : 'right',
//                       fontSize: '10px',
//                       verticalAlign: 'top'
//                     }}>
//                       {cell}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
              
//               {/* Summary Rows */}
//               <tr style={{ borderTop: '2px solid #000' }}>
//                 <td colSpan={tableHeaders.length - 1} style={{ 
//                   border: '1px solid #ddd', 
//                   padding: '8px 4px', 
//                   textAlign: 'right',
//                   fontWeight: 'bold',
//                   fontSize: '10px'
//                 }}>
//                   Subtotal
//                 </td>
//                 <td style={{ 
//                   border: '1px solid #ddd', 
//                   padding: '8px 4px', 
//                   textAlign: 'right',
//                   fontWeight: 'bold',
//                   fontSize: '10px'
//                 }}>
//                   ₹{formatCurrency(subtotal)}
//                 </td>
//               </tr>
              
//               {!hiddenColumns.hideTotalFlatDisc && totalFlatDiscount > 0 && (
//                 <tr>
//                   <td colSpan={tableHeaders.length - 1} style={{ 
//                     border: '1px solid #ddd', 
//                     padding: '8px 4px', 
//                     textAlign: 'right',
//                     fontSize: '10px'
//                   }}>
//                     Total Flat Discount
//                   </td>
//                   <td style={{ 
//                     border: '1px solid #ddd', 
//                     padding: '8px 4px', 
//                     textAlign: 'right',
//                     fontSize: '10px'
//                   }}>
//                     -₹{formatCurrency(totalFlatDiscount)}
//                   </td>
//                 </tr>
//               )}

//               {/* updated for Total Discount */}

//                 {!hiddenColumns.hideSpecialDiscount && (
//   <tr>
//     <td
//       colSpan={tableHeaders.length - 1}
//       style={{
//         border: "1px solid #ddd",
//         padding: "8px 4px",
//         textAlign: "right",
//         fontSize: "10px",
//       }}
//     >
//       Total Discount
//     </td>
//     <td
//       style={{
//         border: "1px solid #ddd",
//         padding: "8px 4px",
//         textAlign: "right",
//         fontSize: "10px",
//       }}
//     >
//       ₹{(() => {
//         const discountFromPercentage = quotationData.items
//           ? quotationData.items.reduce((sum, item) => {
//               const itemTotal = item.qty * item.rate;
//               return sum + (itemTotal * ((item.discount || 0) / 100));
//             }, 0)
//           : 0;
//         const totalDiscount = discountFromPercentage + totalFlatDiscount + (Number(specialDiscount) || 0);
//         return formatCurrency(totalDiscount);
//       })()}
//     </td>
//   </tr>
// )}
              
//               <tr>
//                 <td colSpan={tableHeaders.length - 1} style={{ 
//                   border: '1px solid #ddd', 
//                   padding: '8px 4px', 
//                   textAlign: 'right',
//                   fontSize: '10px'
//                 }}>
//                   Taxable Amount
//                 </td>
//                 <td style={{ 
//                   border: '1px solid #ddd', 
//                   padding: '8px 4px', 
//                   textAlign: 'right',
//                   fontSize: '10px'
//                 }}>
//                   ₹{formatCurrency(taxableAmount)}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Tax Breakdown and Amount in Words - Side by side like preview */}
//         <div style={{ display: 'flex', marginBottom: '20px', gap: '16px' }}>
//           <div style={{ width: '50%' }}>
//             <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Tax Breakdown</h4>
//             <table style={{ 
//               width: '100%', 
//               borderCollapse: 'collapse',
//               fontSize: '10px',
//               border: '1px solid #ccc'
//             }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#f8f9fa' }}>
//                   <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>Tax Type</th>
//                   <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>Rate</th>
//                   <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {quotationData.isIGST ? (
//                   <tr>
//                     <td style={{ border: '1px solid #ddd', padding: '6px' }}>IGST</td>
//                     <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quotationData.igstRate || 18}%</td>
//                     <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(quotationData.igstAmount || 0)}</td>
//                   </tr>
//                 ) : (
//                   <>
//                     <tr>
//                       <td style={{ border: '1px solid #ddd', padding: '6px' }}>CGST</td>
//                       <td style={{ border: '1px solid #ddd', padding: '6px' }}>{cgstRate}%</td>
//                       <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(cgstAmount)}</td>
//                     </tr>
//                     <tr>
//                       <td style={{ border: '1px solid #ddd', padding: '6px' }}>SGST</td>
//                       <td style={{ border: '1px solid #ddd', padding: '6px' }}>{sgstRate}%</td>
//                       <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(sgstAmount)}</td>
//                     </tr>
//                   </>
//                 )}
//                 <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
//                   <td style={{ border: '1px solid #ddd', padding: '6px' }}>Total Tax</td>
//                   <td style={{ border: '1px solid #ddd', padding: '6px' }}>
//                     {quotationData.isIGST ? quotationData.igstRate || 18 : cgstRate + sgstRate}%
//                   </td>
//                   <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(totalTax)}</td>
//                 </tr>
//                 {!hiddenColumns.hideSpecialDiscount && specialDiscount > 0 && (
//                   <tr>
//                     <td style={{ border: '1px solid #ddd', padding: '6px' }} colSpan="2">Special Discount</td>
//                     <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>-₹{formatCurrency(specialDiscount)}</td>
//                   </tr>
//                 )}
//                 <tr style={{ backgroundColor: '#e6f3ff', fontWeight: 'bold' }}>
//                   <td style={{ border: '1px solid #ddd', padding: '6px' }} colSpan="2">Grand Total</td>
//                   <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(grandTotal)}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
          
//           <div style={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
//             <div>
//               <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Amount Chargeable (in words)</h4>
//               <p style={{ fontSize: '11px', margin: '0', textTransform: 'capitalize' }}>
//                 Rupees {Number(grandTotal) > 0
//                   ? new Intl.NumberFormat("en-IN", {
//                       style: "currency",
//                       currency: "INR",
//                       minimumFractionDigits: 2,
//                     })
//                       .format(grandTotal)
//                       .replace("₹", "")
//                       .trim() + " Only"
//                   : "Zero Only"}
//               </p>
//             </div>
//             <div style={{ textAlign: 'right' }}>
//               <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
//                 Grand Total: ₹{formatCurrency(grandTotal)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* ManiqQuip Logo and Terms Section - Better page break handling */}
//         <div style={{ 
//           marginTop: '20px', 
//           borderTop: '1px solid #ddd', 
//           paddingTop: '16px',
//           pageBreakInside: 'avoid',
//           breakInside: 'avoid'
//         }}>
//           <div style={{ display: 'flex', gap: '32px' }}>
//             {/* ManiqQuip Logo Section - FIXED */}
//            {/* <div
//   style={{
//     width: '50%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: '24px',
//     border: '1px solid #ddd',
//     borderRadius: '8px',
//     backgroundColor: '#f0f8ff',
//   }}
// >
//   <img
//     src={maniquipLogo}
//     alt="ManiQuip Logo"
//     style={{
//       width: '400px',    // Increase width here
//       height: 'auto',    // Keeps aspect ratio
//       objectFit: 'contain',
//     }}
//   />
// </div> */}


//             {/* Terms & Conditions */}
//             <div style={{ width: '50%' }}>
//               <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
//                 Terms & Conditions
//               </h4>
//               <table style={{ width: '100%', fontSize: '11px', lineHeight: '1.4' }}>
//                 <tbody>
//                   <tr>
//                     <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top', width: '100px' }}>Validity</td>
//                     <td style={{ padding: '4px 0' }}>{quotationData.validity || "The above quoted prices are valid up to 10 days from date of offer."}</td>
//                   </tr>
//                   <tr>
//                     <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Payment Terms</td>
//                     <td style={{ padding: '4px 0' }}>{quotationData.paymentTerms || "100% advance payment in the mode of NEFT, RTGS & DD. Payment only accepted in company's account – DIVINE EMPIRE INDIA PVT LTD."}</td>
//                   </tr>
//                   <tr>
//                     <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Delivery</td>
//                     <td style={{ padding: '4px 0' }}>{quotationData.delivery || "Material will be dispatched after receipt of advance payment and upon confirmation of complete purchase order (PO) from the buyer."}</td>
//                   </tr>
//                   <tr>
//                     <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Freight</td>
//                     <td style={{ padding: '4px 0' }}>{quotationData.freight || "Extra mentioned in the quotation."}</td>
//                   </tr>
//                   <tr>
//                     <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Insurance</td>
//                     <td style={{ padding: '4px 0' }}>{quotationData.insurance || "Transit insurance for all shipment is at Buyer's scope."}</td>
//                   </tr>
//                   <tr>
//                     <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Taxes</td>
//                     <td style={{ padding: '4px 0' }}>{quotationData.taxes || "Extra mentioned in the quotation."}</td>
//                   </tr>
//                 </tbody>
//               </table>

//               {/* Special Offers */}
//               {quotationData.specialOffers && quotationData.specialOffers.filter(offer => offer.trim()).length > 0 && (
//                 <div style={{ marginTop: '16px' }}>
//                   <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#e65100' }}>
//                     Divine Empire's 10th Anniversary Special Offer
//                   </h4>
//                   <div style={{ 
//                     backgroundColor: '#fff3e0', 
//                     padding: '12px', 
//                     borderRadius: '4px',
//                     border: '1px solid #ffcc80',
//                     fontSize: '10px'
//                   }}>
//                     {quotationData.specialOffers.filter(offer => offer.trim()).map((offer, index) => (
//                       <p key={index} style={{ margin: '4px 0' }}>• {offer}</p>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Notes */}
//               {quotationData.notes && quotationData.notes.filter(note => note.trim()).length > 0 && (
//                 <div style={{ marginTop: '16px' }}>
//                   <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Notes</h4>
//                   <ul style={{ paddingLeft: '20px', margin: '0', fontSize: '10px' }}>
//                     {quotationData.notes.filter(note => note.trim()).map((note, index) => (
//                       <li key={index} style={{ padding: '2px 0' }}>{note}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Bank Details and Declaration - Better page break handling */}
//        {/* Bank Details and QR Code - Updated layout */}
//         <div style={{ 
//           display: 'flex', 
//           gap: '16px', 
//           marginTop: '20px',
//           borderTop: '1px solid #ddd',
//           paddingTop: '16px',
//           pageBreakInside: 'avoid',
//           breakInside: 'avoid'
//         }}>
//           <div style={{ width: '50%' }}>
//             <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>Bank Details</h4>
//             <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
//               <p style={{ margin: '3px 0' }}>Account No.: {quotationData.accountNo || "N/A"}</p>
//               <p style={{ margin: '3px 0' }}>Bank Name: {quotationData.bankName || "N/A"}</p>
//               <p style={{ margin: '3px 0' }}>Bank Address: {quotationData.bankAddress || "N/A"}</p>
//               <p style={{ margin: '3px 0' }}>IFSC CODE: {quotationData.ifscCode || "N/A"}</p>
//               <p style={{ margin: '3px 0' }}>Email: {quotationData.email || "N/A"}</p>
//               <p style={{ margin: '3px 0' }}>Website: {quotationData.website || "N/A"}</p>
//               <p style={{ margin: '3px 0' }}>Company PAN: {quotationData.pan || "N/A"}</p>
//             </div>
//           </div>
          
//           {/* QR Code Section */}
//           <div style={{ 
//             width: '50%', 
//             display: 'flex', 
//             justifyContent: 'center', 
//             alignItems: 'center',
//             padding: '16px'
//           }}>
//             <div style={{
//               textAlign: 'center',
//               border: '1px solid #ddd',
//               borderRadius: '8px',
//               padding: '3px',
//               backgroundColor: '#f9f9f9'
//             }}>
//               <img
//                 src={qr}
//                 alt="QR Code"
//                 style={{
//                   width: '170px',
//                   height: '170px',
//                   objectFit: 'contain'
//                 }}
//               />
//               <p style={{ fontSize: '10px', margin: '8px 0 0 0', fontWeight: 'bold' }}>
//                 Scan for Payment
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Declaration moved to bottom - New separate section */}
//         <div style={{ 
//           marginTop: '20px',
//           borderTop: '1px solid #ddd',
//           paddingTop: '16px',
//           textAlign: 'right',
//           pageBreakInside: 'avoid',
//           breakInside: 'avoid'
//         }}>
//           <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>Declaration:</h4>
//           <p style={{ fontSize: '11px', lineHeight: '1.4', margin: '0 0 16px 0' }}>
//             We declare that this Quotation shows the actual price of the goods described 
//             and that all particulars are true and correct.
//           </p>
//           <p style={{ fontSize: '11px', margin: '16px 0' }}>
//             Prepared By: {quotationData.preparedBy || "N/A"}
//           </p>
//           <p style={{ fontSize: '9px', fontStyle: 'italic', margin: '16px 0 0 0' }}>
//             This Quotation is computer-generated and does not require a seal or signature.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Function to generate HTML string from React component
// export const generateHTMLFromData = (quotationData, selectedReferences, specialDiscount, hiddenColumns = {}) => {
//   const htmlString = ReactDOMServer.renderToStaticMarkup(
//     React.createElement(QuotationPDFComponent, {
//       quotationData,
//       selectedReferences,
//       specialDiscount,
//       hiddenColumns
//     })
//   );
  
//  return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8">
//   <title>Quotation ${quotationData.quotationNo || 'NBD-002'}</title>
//   <style>
//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body { 
//       font-family: Arial, sans-serif; 
//       -webkit-print-color-adjust: exact;
//       color-adjust: exact;
//       print-color-adjust: exact;
//       line-height: 1.4;
//     }
//     @media print {
//       body { margin: 0; }
//       @page { 
//         size: A4; 
//         margin: 15mm 10mm 15mm 10mm;
//       }
//       .page-break {
//         page-break-before: always;
//         break-before: page;
//       }
//       .avoid-break {
//         page-break-inside: avoid;
//         break-inside: avoid;
//       }
//       table {
//         page-break-inside: auto;
//       }
//       tr {
//         page-break-inside: avoid;
//         break-inside: avoid;
//       }
//       thead {
//         display: table-header-group;
//       }
//       tbody {
//         display: table-row-group;
//       }
//       /* Prevent orphaned content */
//       h1, h2, h3, h4 {
//         page-break-after: avoid;
//         break-after: avoid;
//       }
//       /* Keep logo sections together */
//       img {
//         page-break-inside: avoid;
//         break-inside: avoid;
//       }
//       /* Bottom corner images on all pages */
//       .bottom-corner-logos {
//         position: fixed !important;
//         bottom: 10mm !important;
//         right: 10mm !important;
//         display: flex !important;
//         align-items: center !important;
//         gap: 10px !important;
//         z-index: 1000 !important;
//         background-color: rgba(255, 255, 255, 0.9) !important;
//         padding: 5px !important;
//         border-radius: 5px !important;
//       }
//     }
//     /* Ensure proper spacing and breaks */
//     .content-section {
//       page-break-inside: avoid;
//       break-inside: avoid;
//       margin-bottom: 10px;
//     }
//     .header-section {
//       page-break-after: avoid;
//       break-after: avoid;
//     }
//     /* Bottom corner images styling for all media */
//     .bottom-corner-logos {
//       position: fixed;
//       bottom: 10mm;
//       right: 10mm;
//       display: flex;
//       align-items: center;
//       gap: 10px;
//       z-index: 1000;
//       background-color: rgba(255, 255, 255, 0.9);
//       padding: 5px;
//       border-radius: 5px;
//     }
//   </style>
// </head>
// <body>
//   ${htmlString}
// </body>
// </html>`;
// };

// // Function to generate PDF using html2pdf library
// export const generatePDFFromData = async (quotationData, selectedReferences, specialDiscount, hiddenColumns = {}) => {
//   try {
//     // Import html2pdf dynamically
//     const html2pdf = (await import('html2pdf.js')).default;
    
//     const htmlString = generateHTMLFromData(quotationData, selectedReferences, specialDiscount, hiddenColumns);
    
//     const options = {
//       margin: [5, 0, 0, 0],
//       filename: `Quotation_${quotationData.quotationNo || 'NBD-002'}.pdf`,
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { 
//         scale: 2,
//         useCORS: true,
//         allowTaint: true,
//         logging: false
//       },
//       jsPDF: { 
//         unit: 'mm', 
//         format: 'a4', 
//         orientation: 'portrait' 
//       }
//     };
    
//     return html2pdf().set(options).from(htmlString).outputPdf('datauristring');
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     throw error;
//   }
// };

// // Alternative function that returns base64 directly (for compatibility)
// export const generatePDFBase64 = async (quotationData, selectedReferences, specialDiscount, hiddenColumns = {}) => {
//   try {
//     const pdfDataUri = await generatePDFFromData(quotationData, selectedReferences, specialDiscount, hiddenColumns);
//     const base64Data = pdfDataUri.split(',')[1];
//     return base64Data;
//   } catch (error) {
//     console.error('Error generating PDF base64:', error);
//     throw error;
//   }
// };

// // Export the React component as well
// export { QuotationPDFComponent };





import React from 'react';
import ReactDOMServer from 'react-dom/server';
import logo from '../../assests/WhatsApp Image 2025-05-14 at 4.11.43 PM.jpeg';
import maniquipLogo from '../../assests/banner.jpeg';
import qr from '../../assests/qrlogo.png';
import maniquipLogo1 from "../../assests/Screenshot 2025-09-25 at 2.48.03 PM.png";

// React PDF Component that matches your preview interface exactly
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

  // Build table headers based on hidden columns
  const tableHeaders = [
    "S No.",
    "Code",
    "Product Name",
  ];
  if (!hiddenColumns.hideDescription) tableHeaders.push("Description");
  tableHeaders.push("GST %", "Qty", "Units", "Rate");

  if (!hiddenColumns.hideDisc) tableHeaders.push("Disc %");
  if (!hiddenColumns.hideFlatDisc) tableHeaders.push("Flat Disc");

  tableHeaders.push("Amount");

  // Build items data
  const itemsData = quotationData.items ? quotationData.items.map((item, index) => {
    const row = [
      String(index + 1),
      String(item.code || "N/A"),
      String(item.name || "N/A"),
    ];
    if (!hiddenColumns.hideDescription) row.push(String(item.description || "N/A"));
    row.push(
      String(`${item.gst || 18}%`),
      String(item.qty || 1),
      String(item.units || "Nos"),
      `₹${formatCurrency(item.rate || 0)}`
    );

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
      ];
      if (!hiddenColumns.hideDescription) defaultRow.push("N/A");
      defaultRow.push("18%", "1", "Nos", "₹0.00");

      if (!hiddenColumns.hideDisc) defaultRow.push("0%");
      if (!hiddenColumns.hideFlatDisc) defaultRow.push("₹0.00");
      return defaultRow;
    })()
  ];

  // Financial calculations - updated to use breakdown objects
  const subtotal = quotationData.subtotal || 0;
  const totalFlatDiscount = quotationData.totalFlatDiscount || 0;
  const taxableAmount = Math.max(0, subtotal - totalFlatDiscount);
  
  // Use the breakdown objects directly for calculations
  const cgstAmount = quotationData.cgstAmount || 0;
  const sgstAmount = quotationData.sgstAmount || 0;
  const igstAmount = quotationData.igstAmount || 0;
  const totalTax = quotationData.isIGST ? igstAmount : (cgstAmount + sgstAmount);
  const grandTotal = taxableAmount + totalTax - (specialDiscount || 0);

  const dateStr = quotationData.date ? new Date(quotationData.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

  return (
    <div style={{ 
      width: '210mm', 
      minHeight: 'auto',
      fontFamily: 'Arial, sans-serif', 
      fontSize: '12px', 
      lineHeight: '1.4',
      margin: '0',
      padding: '20px',
      backgroundColor: 'white',
      color: 'black',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      
      {/* Header Section with Company Logo */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #000',
        position: 'relative',
        pageBreakInside: 'avoid'
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
            color: '#113878ff',
            margin: '0',
            lineHeight: '1.2'
          }}>
            DIVINE EMPIRE INDIA
          </h1>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#113878ff',
            margin: '0',
            lineHeight: '1.2'
          }}>
            ( PVT. LTD. )
          </h2>
        </div>

        <div style={{ width: '140px', height: '100px' }}>
          <img 
            src={maniquipLogo1} 
            alt="ManiQuip Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>
      </div>
      
      {/* Main Content - Matches Preview Layout */}
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '24px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        pageBreakInside: 'avoid'
      }}>
        
        {/* Header Section - Simplified without contact details */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid #ddd',
          }}
        >
          <div style={{ width: '33%', textAlign: 'left' }}>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                margin: '0',
                color: '#333',
              }}
            >
              QUOTATION
            </h1>
          </div>

          <div style={{ width: '33%', textAlign: 'right' }}>
            <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: 'bold' }}>
              Quo No: {quotationData.quotationNo || 'NBD-002'}
            </p>
            <p style={{ margin: '2px 0', fontSize: '12px' }}>Date: {dateStr}</p>
          </div>
        </div>

        {/* Consignor and Consignee Details - Updated with mobile and phone */}
        <div style={{ 
          display: 'flex',
          marginBottom: '16px',
          gap: '16px'
        }}>
          <div style={{ width: '50%' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
              Consignor Details
            </h3>
            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <p style={{ margin: '2px 0' }}>{selectedReferences && selectedReferences[0] ? selectedReferences[0] : "N/A"}</p>
              <p style={{ margin: '2px 0' }}>{quotationData.consignorAddress || "N/A"}</p>
              <p style={{ margin: '2px 0' }}>Mobile: {quotationData.consignorMobile || "N/A"}</p>
              <p style={{ margin: '2px 0' }}>Phone: 0772-400515</p>
              <p style={{ margin: '2px 0' }}>GSTIN: {quotationData.consignorGSTIN || "N/A"}</p>
              <p style={{ margin: '2px 0' }}>State Code: {quotationData.consignorStateCode || "N/A"}</p>
              <p style={{ margin: '2px 0' }}>MSME Number: {quotationData.msmeNumber || "N/A"}</p>
            </div>
          </div>
          
          <div style={{ width: '50%' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
              Consignee Details
            </h3>
            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <p style={{ margin: '2px 0' }}>Company Name: {quotationData.consigneeName || "N/A"}</p>
              <p style={{ margin: '2px 0' }}>Contact Name: {quotationData.consigneeContactName || "N/A"}</p>
              <p style={{ margin: '2px 0' }}>Contact No.: {quotationData.consigneeContactNo || "N/A"}</p>
              <p style={{ margin: '2px 0' }}>State: {quotationData.consigneeState || "N/A"}</p>
              <p style={{ margin: '2px 0' }}>GSTIN: {quotationData.consigneeGSTIN || "N/A"}</p>
              <p style={{ margin: '2px 0' }}>State Code: {quotationData.consigneeStateCode || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Bill To and Ship To */}
        <div style={{ 
          display: 'flex',
          marginBottom: '16px',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #ddd'
        }}>
          <div style={{ width: '50%' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Bill To</h3>
            <p style={{ margin: '0', fontSize: '11px' }}>{quotationData.consigneeAddress || "N/A"}</p>
          </div>
          
          <div style={{ width: '50%' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Ship To</h3>
            <p style={{ margin: '0', fontSize: '11px' }}>{quotationData.shipTo || "N/A"}</p>
          </div>
        </div>

        {/* Items Table - Clean design like preview */}
        <div style={{ marginBottom: '16px' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '10px',
            border: '1px solid #ccc'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                {tableHeaders.map((header, index) => (
                  <th key={index} style={{ 
                    border: '1px solid #ddd', 
                    padding: '8px 4px', 
                    textAlign: 'left',
                    fontWeight: 'bold',
                    fontSize: '10px'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {itemsData.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ borderBottom: '1px solid #ddd' }}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{ 
                      border: '1px solid #ddd', 
                      padding: '8px 4px', 
                      textAlign: cellIndex === 0 || cellIndex === 4 || cellIndex === 5 || cellIndex === 6 ? 'center' : 
                               cellIndex === 2 || cellIndex === 3 ? 'left' : 'right',
                      fontSize: '10px',
                      verticalAlign: 'top'
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Summary Rows */}
              <tr style={{ borderTop: '2px solid #000' }}>
                <td colSpan={tableHeaders.length - 1} style={{ 
                  border: '1px solid #ddd', 
                  padding: '8px 4px', 
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '10px'
                }}>
                  Subtotal
                </td>
                <td style={{ 
                  border: '1px solid #ddd', 
                  padding: '8px 4px', 
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '10px'
                }}>
                  ₹{formatCurrency(subtotal)}
                </td>
              </tr>
              
              {!hiddenColumns.hideTotalFlatDisc && totalFlatDiscount > 0 && (
                <tr>
                  <td colSpan={tableHeaders.length - 1} style={{ 
                    border: '1px solid #ddd', 
                    padding: '8px 4px', 
                    textAlign: 'right',
                    fontSize: '10px'
                  }}>
                    Total Flat Discount
                  </td>
                  <td style={{ 
                    border: '1px solid #ddd', 
                    padding: '8px 4px', 
                    textAlign: 'right',
                    fontSize: '10px'
                  }}>
                    -₹{formatCurrency(totalFlatDiscount)}
                  </td>
                </tr>
              )}

              {!hiddenColumns.hideSpecialDiscount && (
                <tr>
                  <td
                    colSpan={tableHeaders.length - 1}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px 4px",
                      textAlign: "right",
                      fontSize: "10px",
                    }}
                  >
                    Total Discount
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px 4px",
                      textAlign: "right",
                      fontSize: "10px",
                    }}
                  >
                    ₹{(() => {
                      const discountFromPercentage = quotationData.items
                        ? quotationData.items.reduce((sum, item) => {
                            const itemTotal = item.qty * item.rate;
                            return sum + (itemTotal * ((item.discount || 0) / 100));
                          }, 0)
                        : 0;
                      const totalDiscount = discountFromPercentage + totalFlatDiscount + (Number(specialDiscount) || 0);
                      return formatCurrency(totalDiscount);
                    })()}
                  </td>
                </tr>
              )}
              
              <tr>
                <td colSpan={tableHeaders.length - 1} style={{ 
                  border: '1px solid #ddd', 
                  padding: '8px 4px', 
                  textAlign: 'right',
                  fontSize: '10px'
                }}>
                  Taxable Amount
                </td>
                <td style={{ 
                  border: '1px solid #ddd', 
                  padding: '8px 4px', 
                  textAlign: 'right',
                  fontSize: '10px'
                }}>
                  ₹{formatCurrency(taxableAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Breakdown and Amount in Words - Side by side like preview */}
        <div style={{ display: 'flex', marginBottom: '20px', gap: '16px' }}>
          <div style={{ width: '50%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Tax Breakdown</h4>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '10px',
              border: '1px solid #ccc'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>Tax Type</th>
                  <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>Rate</th>
                  <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {quotationData.isIGST ? (
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>IGST</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>{quotationData.igstRate || 18}%</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(quotationData.igstAmount || 0)}</td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>CGST</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{cgstRate}%</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(cgstAmount)}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>SGST</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{sgstRate}%</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(sgstAmount)}</td>
                    </tr>
                  </>
                )}
                <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid #ddd', padding: '6px' }}>Total Tax</td>
                  <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                    {quotationData.isIGST ? quotationData.igstRate || 18 : cgstRate + sgstRate}%
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(totalTax)}</td>
                </tr>
                {!hiddenColumns.hideSpecialDiscount && specialDiscount > 0 && (
                  <tr>
                    <td style={{ border: '1px solid #ddd', padding: '6px' }} colSpan="2">Special Discount</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>-₹{formatCurrency(specialDiscount)}</td>
                  </tr>
                )}
                <tr style={{ backgroundColor: '#e6f3ff', fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid #ddd', padding: '6px' }} colSpan="2">Grand Total</td>
                  <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>₹{formatCurrency(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Amount Chargeable (in words)</h4>
              <p style={{ fontSize: '11px', margin: '0', textTransform: 'capitalize' }}>
                Rupees {Number(grandTotal) > 0
                  ? new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      minimumFractionDigits: 2,
                    })
                      .format(grandTotal)
                      .replace("₹", "")
                      .trim() + " Only"
                  : "Zero Only"}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
                Grand Total: ₹{formatCurrency(grandTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* ManiqQuip Logo and Terms Section */}
        <div style={{ 
          marginTop: '20px', 
          borderTop: '1px solid #ddd', 
          paddingTop: '16px',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            {/* Terms & Conditions */}
            <div style={{ width: '100%' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
                Terms & Conditions
              </h4>
              <table style={{ width: '100%', fontSize: '11px', lineHeight: '1.4' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top', width: '100px' }}>Validity</td>
                    <td style={{ padding: '4px 0' }}>{quotationData.validity || "The above quoted prices are valid up to 10 days from date of offer."}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Payment Terms</td>
                    <td style={{ padding: '4px 0' }}>{quotationData.paymentTerms || "100% advance payment in the mode of NEFT, RTGS & DD. Payment only accepted in company's account – DIVINE EMPIRE INDIA PVT LTD."}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Delivery</td>
                    <td style={{ padding: '4px 0' }}>{quotationData.delivery || "Material will be dispatched after receipt of advance payment and upon confirmation of complete purchase order (PO) from the buyer."}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Freight</td>
                    <td style={{ padding: '4px 0' }}>{quotationData.freight || "Extra mentioned in the quotation."}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Insurance</td>
                    <td style={{ padding: '4px 0' }}>{quotationData.insurance || "Transit insurance for all shipment is at Buyer's scope."}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>Taxes</td>
                    <td style={{ padding: '4px 0' }}>{quotationData.taxes || "Extra mentioned in the quotation."}</td>
                  </tr>
                </tbody>
              </table>

              {/* Special Offers */}
              {quotationData.specialOffers && quotationData.specialOffers.filter(offer => offer.trim()).length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#e65100' }}>
                    Divine Empire's 10th Anniversary Special Offer
                  </h4>
                  <div style={{ 
                    backgroundColor: '#fff3e0', 
                    padding: '12px', 
                    borderRadius: '4px',
                    border: '1px solid #ffcc80',
                    fontSize: '10px'
                  }}>
                    {quotationData.specialOffers.filter(offer => offer.trim()).map((offer, index) => (
                      <p key={index} style={{ margin: '4px 0' }}>• {offer}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {quotationData.notes && quotationData.notes.filter(note => note.trim()).length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Notes</h4>
                  <ul style={{ paddingLeft: '20px', margin: '0', fontSize: '10px' }}>
                    {quotationData.notes.filter(note => note.trim()).map((note, index) => (
                      <li key={index} style={{ padding: '2px 0' }}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bank Details and QR Code */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginTop: '20px',
          borderTop: '1px solid #ddd',
          paddingTop: '16px',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}>
          <div style={{ width: '50%' }}>
            <h4 style={{ margin: '0 0 1px 0', fontSize: '14px', fontWeight: 'bold' }}>Bank Details</h4>
            <h6 style={{margin: '0 0 8px 0'}}>DIVINE EMPIRE INDIA PVT LTD.</h6>
            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <p style={{ margin: '3px 0' }}>Account No.: {quotationData.accountNo || "N/A"}</p>
              <p style={{ margin: '3px 0' }}>Bank Name: {quotationData.bankName || "N/A"}</p>
              <p style={{ margin: '3px 0' }}>Bank Address: {quotationData.bankAddress || "N/A"}</p>
              <p style={{ margin: '3px 0' }}>IFSC CODE: {quotationData.ifscCode || "N/A"}</p>
              <p style={{ margin: '3px 0' }}>Email: {quotationData.email || "N/A"}</p>
              <p style={{ margin: '3px 0' }}>Website: {quotationData.website || "N/A"}</p>
              <p style={{ margin: '3px 0' }}>Company PAN: {quotationData.pan || "N/A"}</p>
            </div>
          </div>
          
          {/* QR Code Section */}
          <div style={{ 
            width: '50%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '3px',
              backgroundColor: '#f9f9f9'
            }}>
              <img
                src={qr}
                alt="QR Code"
                style={{
                  width: '170px',
                  height: '170px',
                  objectFit: 'contain'
                }}
              />
              <p style={{ fontSize: '10px', margin: '8px 0 0 0', fontWeight: 'bold' }}>
                Scan for Payment
              </p>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div style={{ 
          marginTop: '20px',
          borderTop: '1px solid #ddd',
          paddingTop: '16px',
          textAlign: 'right',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>Declaration:</h4>
          <p style={{ fontSize: '11px', lineHeight: '1.4', margin: '0 0 16px 0' }}>
            We declare that this Quotation shows the actual price of the goods described 
            and that all particulars are true and correct.
          </p>
          <p style={{ fontSize: '11px', margin: '16px 0' }}>
            Prepared By: {quotationData.preparedBy || "N/A"}
          </p>
          <p style={{ fontSize: '9px', fontStyle: 'italic', margin: '16px 0 0 0' }}>
            This Quotation is computer-generated and does not require a seal or signature.
          </p>
        </div>
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
      print-color-adjust: exact;
      line-height: 1.4;
    }
    @media print {
      body { margin: 0; }
      @page { 
        size: A4; 
        margin: 15mm 10mm 15mm 10mm;
      }
      .page-break {
        page-break-before: always;
        break-before: page;
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
      h1, h2, h3, h4 {
        page-break-after: avoid;
        break-after: avoid;
      }
      img {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
    .content-section {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 10px;
    }
    .header-section {
      page-break-after: avoid;
      break-after: avoid;
    }
  </style>
</head>
<body>
  ${htmlString}
</body>
</html>`;
};

// Client-side only PDF generation
export const generatePDFFromData = async (quotationData, selectedReferences, specialDiscount, hiddenColumns = {}) => {
  // Check if we're in the browser environment
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in the browser environment. Please run this function on the client side.');
  }

  try {
    console.log('Starting PDF generation...');
    
    // Dynamic import ONLY in browser environment
    const html2pdf = (await import('html2pdf.js')).default;
    
    const htmlString = generateHTMLFromData(quotationData, selectedReferences, specialDiscount, hiddenColumns);
    
    const options = {
      margin: [5, 0, 0, 0],
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
    
    console.log('Generating PDF with html2pdf...');
    const pdfDataUri = await html2pdf().set(options).from(htmlString).outputPdf('datauristring');
    console.log('PDF generated successfully');
    
    return pdfDataUri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

// Alternative function that returns base64 directly
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

// Export the React component
export { QuotationPDFComponent };