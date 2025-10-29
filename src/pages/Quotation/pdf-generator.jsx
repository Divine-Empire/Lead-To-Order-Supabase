
import React from "react";
import ReactDOMServer from "react-dom/server";
import logo from "../../assests/WhatsApp Image 2025-05-14 at 4.11.43 PM.jpeg";
import maniquipLogo from "../../assests/banner.jpeg";
import qr from "../../assests/qrlogo.png";
import maniquipLogo1 from "../../assests/Screenshot 2025-09-25 at 2.48.03 PM.png";

// React PDF Component that matches your preview interface exactly
// Function to convert number to words for Indian Rupees
const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertHundreds = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 !== 0 ? " " + convertHundreds(n % 100) : "")
      );
    if (n < 100000)
      return (
        convertHundreds(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 !== 0 ? " " + convertHundreds(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convertHundreds(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 !== 0 ? " " + convertHundreds(n % 100000) : "")
      );
    return (
      convertHundreds(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 !== 0 ? " " + convertHundreds(n % 10000000) : "")
    );
  };

  if (num === 0) return "Zero";

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = "";
  if (rupees > 0) {
    result += convertHundreds(rupees) + " Rupees";
  }
  if (paise > 0) {
    if (rupees > 0) result += " and ";
    result += convertHundreds(paise) + " Paise";
  }

  return result + " Only";
};

const QuotationPDFComponent = ({
  quotationData,
  selectedReferences,
  specialDiscount,
  hiddenColumns = {},
 hiddenFields = {}, // ← यह add करें

}) => {
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
  const tableHeaders = ["S No.", "Code", "Product Name"];
  if (!hiddenColumns.hideDescription) tableHeaders.push("Description");
  tableHeaders.push("GST %", "Qty", "Units", "Rate");

  if (!hiddenColumns.hideDisc) tableHeaders.push("Disc %");
  if (!hiddenColumns.hideFlatDisc) tableHeaders.push("Flat Disc");

  tableHeaders.push("Amount");

  // Build items data - FIXED QUANTITY DISPLAY ISSUE
  const itemsData = quotationData.items
    ? quotationData.items.map((item, index) => {
        const row = [
          String(index + 1),
          String(item.code || "N/A"),
          String(item.name || "N/A"),
        ];
        if (!hiddenColumns.hideDescription)
          row.push(String(item.description || "N/A"));
        
        // FIXED: Ensure quantity is displayed correctly
        const quantity = Number(item.qty) || 1;
        row.push(
          String(`${item.gst || 18}%`),
          String(quantity), // This ensures proper quantity display
          String(item.units || "Nos"),
          `₹${formatCurrency(item.rate || 0)}`
        );

        if (!hiddenColumns.hideDisc) row.push(String(`${item.discount || 0}%`));
        if (!hiddenColumns.hideFlatDisc)
          row.push(`₹${formatCurrency(item.flatDiscount || 0)}`);
        row.push(`₹${formatCurrency(item.amount || 0)}`);
        return row;
      })
    : [
        (() => {
          const defaultRow = ["1", "N/A", "N/A"];
          if (!hiddenColumns.hideDescription) defaultRow.push("N/A");
          defaultRow.push("18%", "1", "Nos", "₹0.00");

          if (!hiddenColumns.hideDisc) defaultRow.push("0%");
          if (!hiddenColumns.hideFlatDisc) defaultRow.push("₹0.00");
          return defaultRow;
        })(),
      ];

  // Financial calculations - updated to use breakdown objects
  const subtotal = quotationData.subtotal || 0;
  const totalFlatDiscount = quotationData.totalFlatDiscount || 0;
  const taxableAmount = Math.max(0, subtotal);

  // Use the breakdown objects directly for calculations
  const cgstAmount = quotationData.cgstAmount || 0;
  const sgstAmount = quotationData.sgstAmount || 0;
  const igstAmount = quotationData.igstAmount || 0;
  const totalTax = quotationData.isIGST ? igstAmount : cgstAmount + sgstAmount;
  const grandTotal = Math.max(
    0,
    Number((subtotal + totalTax - (specialDiscount || 0)).toFixed(2))
  );

  const dateStr = (() => {
    if (!quotationData.date) {
      return new Date().toLocaleDateString("en-GB");
    }

    // Check if date is already in DD/MM/YYYY format (from QuotationDetails)
    if (
      typeof quotationData.date === "string" &&
      quotationData.date.includes("/")
    ) {
      const [day, month, year] = quotationData.date.split("/");
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }

    // Fallback for other date formats
    try {
      return new Date(quotationData.date).toLocaleDateString("en-GB");
    } catch (error) {
      return new Date().toLocaleDateString("en-GB");
    }
  })();

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "auto",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.4",
        margin: "0",
        padding: "20px",
        backgroundColor: "white",
        color: "black",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Header Section with Company Logo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "15px",
          borderBottom: "1px solid #000",
          position: "relative",
          pageBreakInside: "avoid",
        }}
      >
        {/* Logo (Left Side) */}
        <div style={{ width: "60px", height: "60px" }}>
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Company Name (Centered) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#113878ff",
              margin: "0",
              lineHeight: "1.2",
            }}
          >
            DIVINE EMPIRE INDIA
          </h1>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#113878ff",
              margin: "0",
              lineHeight: "1.2",
            }}
          >
            ( PVT. LTD. )
          </h2>
        </div>

        <div style={{ width: "140px", height: "60px" }}>
          <img
            src={maniquipLogo1}
            alt="ManiQuip Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Main Content - Matches Preview Layout */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "24px",
          borderRadius: "8px",
          backgroundColor: "#fff",
          pageBreakInside: "avoid",
        }}
      >
        {/* Header Section - Simplified without contact details */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
            paddingBottom: "16px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <div style={{ width: "33%", textAlign: "left" }}>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                margin: "0",
                color: "#333",
              }}
            >
              QUOTATION
            </h1>
          </div>

          <div style={{ width: "33%", textAlign: "right" }}>
            <p
              style={{ margin: "2px 0", fontSize: "12px", fontWeight: "bold" }}
            >
              Quo No: {quotationData.quotationNo || "NBD-002"}
            </p>
            <p style={{ margin: "2px 0", fontSize: "12px" }}>Date: {dateStr}</p>
          </div>
        </div>

        {/* Consignor and Consignee Details - Updated with mobile and phone */}
        <div
          style={{
            display: "flex",
            marginBottom: "16px",
            gap: "16px",
          }}
        >
          <div style={{ width: "50%" }}>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Consignor Details
            </h3>
            <p>DIVINE EMPIRE INDIA( PVT. LTD. )
</p>
            <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
              <p style={{ margin: "2px 0" }}>
                {selectedReferences && selectedReferences[0]
                  ? selectedReferences[0]
                  : "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                {quotationData.consignorAddress || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                Mobile: {quotationData.consignorMobile || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>Phone: 0772-400515</p>
              <p style={{ margin: "2px 0" }}>
                GSTIN: {quotationData.consignorGSTIN || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                State Code: {quotationData.consignorStateCode || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                MSME Number: {quotationData.msmeNumber || "N/A"}
              </p>
            </div>
          </div>

          <div style={{ width: "50%" }}>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Consignee Details
            </h3>
            <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
              <p style={{ margin: "2px 0" }}>
                Company Name: {quotationData.consigneeName || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                Contact Name: {quotationData.consigneeContactName || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                Contact No.: {quotationData.consigneeContactNo || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                State: {quotationData.consigneeState || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                GSTIN: {quotationData.consigneeGSTIN || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                State Code: {quotationData.consigneeStateCode || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Bill To and Ship To */}
        <div
          style={{
            display: "flex",
            marginBottom: "16px",
            gap: "16px",
            paddingBottom: "16px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <div style={{ width: "50%" }}>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Bill To
            </h3>
            <p style={{ margin: "0", fontSize: "11px" }}>
              {quotationData.consigneeAddress || "N/A"}
            </p>
          </div>

          <div style={{ width: "50%" }}>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Ship To
            </h3>
            <p style={{ margin: "0", fontSize: "11px" }}>
              {quotationData.shipTo || "N/A"}
            </p>
          </div>
        </div>

        {/* Items Table - Clean design like preview */}
        <div style={{ marginBottom: "16px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "10px",
              border: "1px solid #ccc",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                {tableHeaders.map((header, index) => (
                  <th
                    key={index}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px 4px",
                      textAlign: "left",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {itemsData.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ borderBottom: "1px solid #ddd" }}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px 4px",
                        textAlign:
                          tableHeaders[cellIndex] === "S No." ||
                          tableHeaders[cellIndex] === "GST %" ||
                          tableHeaders[cellIndex] === "Qty" ||
                          tableHeaders[cellIndex] === "Units" ||
                          tableHeaders[cellIndex] === "Disc %" ||
                          tableHeaders[cellIndex] === "Flat Disc"
                            ? "center"
                            : tableHeaders[cellIndex] === "Product Name" ||
                              tableHeaders[cellIndex] === "Description" ||
                              tableHeaders[cellIndex] === "Code"
                            ? "left"
                            : "right",
                        fontSize: "10px",
                        verticalAlign: "top",
                        width:
                          tableHeaders[cellIndex] === "Product Name"
                            ? "150px"
                            : tableHeaders[cellIndex] === "Description"
                            ? "300px"
                            : "auto",
                        whiteSpace:
                          tableHeaders[cellIndex] === "Product Name" ||
                          tableHeaders[cellIndex] === "Description"
                            ? "normal"
                            : "nowrap",
                        wordBreak:
                          tableHeaders[cellIndex] === "Product Name" ||
                          tableHeaders[cellIndex] === "Description"
                            ? "break-word"
                            : "normal",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Summary Rows */}
              <tr style={{ borderTop: "2px solid #000" }}>
                <td
                  colSpan={tableHeaders.length - 1}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px 4px",
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  Subtotal
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px 4px",
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  ₹{formatCurrency(subtotal)}
                </td>
              </tr>

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
                  Total Qty
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px 4px",
                    textAlign: "right",
                    fontSize: "10px",
                  }}
                >
                  {quotationData.items.reduce(
                    (sum, item) => sum + (Number(item.qty) || 0), // Ensure proper number conversion
                    0
                  )}
                </td>
              </tr>

              {!hiddenColumns.hideTotalFlatDisc && totalFlatDiscount > 0 && (
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
                    Total Flat Discount
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px 4px",
                      textAlign: "right",
                      fontSize: "10px",
                    }}
                  >
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
                    ₹
                    {(() => {
                      const discountFromPercentage = quotationData.items
                        ? quotationData.items.reduce((sum, item) => {
                            const itemTotal = item.qty * item.rate;
                            return (
                              sum + itemTotal * ((item.discount || 0) / 100)
                            );
                          }, 0)
                        : 0;
                      const totalDiscount =
                        discountFromPercentage +
                        totalFlatDiscount +
                        (Number(specialDiscount) || 0);
                      return formatCurrency(totalDiscount);
                    })()}
                  </td>
                </tr>
              )}

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
                  Taxable Amount
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px 4px",
                    textAlign: "right",
                    fontSize: "10px",
                  }}
                >
                  ₹{formatCurrency(taxableAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Breakdown and Amount in Words - Side by side like preview */}
        {/* Tax Breakdown and Amount in Words - Side by side like preview */}
        <div style={{ display: "flex", marginBottom: "20px", gap: "16px" }}>
          <div style={{ width: "50%" }}>
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Tax Breakdown
            </h4>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "10px",
                border: "1px solid #ccc",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px",
                      textAlign: "left",
                    }}
                  >
                    Tax Type
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px",
                      textAlign: "left",
                    }}
                  >
                    Rate
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px",
                      textAlign: "left",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotationData.isIGST ? (
                  <>
                    {Object.entries(quotationData.igstBreakdown || {}).map(
                      ([rate, value]) => (
                        <tr className="border" key={`igst-${rate}`}>
                          <td
                            style={{ border: "1px solid #ddd", padding: "6px" }}
                          >
                            IGST
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "6px" }}
                          >
                            {Number(rate)}%
                          </td>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "6px",
                              textAlign: "right",
                            }}
                          >
                            ₹{formatCurrency(Number(value))}
                          </td>
                        </tr>
                      )
                    )}
                    <tr
                      style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
                    >
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                        IGST Total
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                        {quotationData.igstRate || 18}%
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "6px",
                          textAlign: "right",
                        }}
                      >
                        ₹{formatCurrency(igstAmount)}
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {Object.entries(quotationData.cgstBreakdown || {}).map(
                      ([rate, value]) => (
                        <tr className="border" key={`cgst-${rate}`}>
                          <td
                            style={{ border: "1px solid #ddd", padding: "6px" }}
                          >
                            CGST
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "6px" }}
                          >
                            {Number(rate)}%
                          </td>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "6px",
                              textAlign: "right",
                            }}
                          >
                            ₹{formatCurrency(Number(value))}
                          </td>
                        </tr>
                      )
                    )}
                    <tr
                      style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
                    >
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                        CGST Total
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                        {quotationData.cgstRate || 9}%
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "6px",
                          textAlign: "right",
                        }}
                      >
                        ₹{formatCurrency(cgstAmount)}
                      </td>
                    </tr>
                    {Object.entries(quotationData.sgstBreakdown || {}).map(
                      ([rate, value]) => (
                        <tr className="border" key={`sgst-${rate}`}>
                          <td
                            style={{ border: "1px solid #ddd", padding: "6px" }}
                          >
                            SGST
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "6px" }}
                          >
                            {Number(rate)}%
                          </td>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "6px",
                              textAlign: "right",
                            }}
                          >
                            ₹{formatCurrency(Number(value))}
                          </td>
                        </tr>
                      )
                    )}
                    <tr
                      style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
                    >
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                        SGST Total
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                        {quotationData.sgstRate || 9}%
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "6px",
                          textAlign: "right",
                        }}
                      >
                        ₹{formatCurrency(sgstAmount)}
                      </td>
                    </tr>
                  </>
                )}
                {!hiddenColumns.hideSpecialDiscount && specialDiscount > 0 && (
                  <tr>
                    <td
                      style={{ border: "1px solid #ddd", padding: "6px" }}
                      colSpan="2"
                    >
                      Special Discount
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "6px",
                        textAlign: "right",
                      }}
                    >
                      -₹{formatCurrency(specialDiscount)}
                    </td>
                  </tr>
                )}
                <tr style={{ backgroundColor: "#e6f3ff", fontWeight: "bold" }}>
                  <td
                    style={{ border: "1px solid #ddd", padding: "6px" }}
                    colSpan="2"
                  >
                    Grand Total
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px",
                      textAlign: "right",
                    }}
                  >
                    ₹{formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Amount Chargeable (in words)
              </h4>
              <p
                style={{
                  fontSize: "11px",
                  margin: "0",
                  textTransform: "capitalize",
                }}
              >
                {Number(grandTotal) > 0
                  ? numberToWords(grandTotal)
                  : "Zero Only"}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "18px", fontWeight: "bold", margin: "0" }}>
                Grand Total: ₹{formatCurrency(grandTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* ManiqQuip Logo and Terms Section */}
        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid #ddd",
            paddingTop: "16px",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            {/* Terms & Conditions */}
            <div style={{ width: "100%" }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Terms & Conditions
              </h4>
              <table style={{ width: "100%", fontSize: "11px", lineHeight: "1.4" }}>
  <tbody>
    {!hiddenFields?.validity && (
      <tr>
        <td style={{
          padding: "4px 0",
          fontWeight: "bold",
          verticalAlign: "top",
          width: "100px",
        }}>
          Validity
        </td>
        <td style={{ padding: "4px 0" }}>
          {quotationData.validity ||
            "The above quoted prices are valid up to 10 days from date of offer."}
        </td>
      </tr>
    )}

    {!hiddenFields?.paymentTerms && (
      <tr>
        <td style={{
          padding: "4px 0",
          fontWeight: "bold",
          verticalAlign: "top",
        }}>
          Payment Terms
        </td>
        <td style={{ padding: "4px 0" }}>
          {quotationData.paymentTerms ||
            "100% advance payment in the mode of NEFT, RTGS & DD. Payment only accepted in company's account – DIVINE EMPIRE INDIA PVT LTD."}
        </td>
      </tr>
    )}

    {!hiddenFields?.delivery && (
      <tr>
        <td style={{
          padding: "4px 0",
          fontWeight: "bold",
          verticalAlign: "top",
        }}>
          Delivery
        </td>
        <td style={{ padding: "4px 0" }}>
          {quotationData.delivery ||
            "Material will be dispatched after receipt of advance payment and upon confirmation of complete purchase order (PO) from the buyer."}
        </td>
      </tr>
    )}

    {!hiddenFields?.freight && (
      <tr>
        <td style={{
          padding: "4px 0",
          fontWeight: "bold",
          verticalAlign: "top",
        }}>
          Freight
        </td>
        <td style={{ padding: "4px 0" }}>
          {quotationData.freight || "Extra as per actual."}
        </td>
      </tr>
    )}

   

    {!hiddenFields?.warranty && (
      <tr>
        <td style={{
          padding: "4px 0",
          fontWeight: "bold",
          verticalAlign: "top",
        }}>
          Warranty
        </td>
        <td style={{ padding: "4px 0" }}>
          {quotationData.warranty ||
            "6 months warranty applicable against Manufacturing defects."}
        </td>
      </tr>
    )}

    {!hiddenFields?.taxes && (
      <tr>
        <td style={{
          padding: "4px 0",
          fontWeight: "bold",
          verticalAlign: "top",
        }}>
          Taxes
        </td>
        <td style={{ padding: "4px 0" }}>
          {quotationData.taxes ||
            "Extra mentioned in the quotation."}
        </td>
      </tr>
    )}

     {!hiddenFields?.insurance && (
      <tr>
        <td style={{
          padding: "4px 0",
          fontWeight: "bold",
          verticalAlign: "top",
        }}>
          Insurance
        </td>
        <td style={{ padding: "4px 0" }}>
          {quotationData.insurance ||
            "Transit insurance for all shipment is at Buyer's scope."}
        </td>
      </tr>
    )}
  </tbody>
</table>

            {/* Special Offers */}
              {quotationData.specialOffers &&
                quotationData.specialOffers.filter((offer) => offer.trim())
                  .length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <h4
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#e65100",
                      }}
                    >
                      Divine Empire's 10th Anniversary Special Offer
                    </h4>
                    <div
                      style={{
                        backgroundColor: "#fff3e0",
                        padding: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ffcc80",
                        fontSize: "10px",
                      }}
                    >
                      {quotationData.specialOffers
                        .filter((offer) => offer.trim())
                        .map((offer, index) => (
                          <p key={index} style={{ margin: "4px 0" }}>
                            • {offer}
                          </p>
                        ))}
                    </div>
                  </div>
                )}

              {/* Notes */}
              {quotationData.notes &&
                quotationData.notes.filter((note) => note.trim()).length >
                  0 && (
                  <div style={{ marginTop: "16px" }}>
                    <h4
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Notes
                    </h4>
                    <ul
                      style={{
                        paddingLeft: "20px",
                        margin: "0",
                        fontSize: "10px",
                      }}
                    >
                      {quotationData.notes
                        .filter((note) => note.trim())
                        .map((note, index) => (
                          <li key={index} style={{ padding: "2px 0" }}>
                            {note}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Bank Details and QR Code */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "20px",
            borderTop: "1px solid #ddd",
            paddingTop: "16px",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}
        >
          <div style={{ width: "50%" }}>
            <h4
              style={{
                margin: "0 0 1px 0",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Bank Details
            </h4>
            <h6 style={{ margin: "0 0 8px 0" }}>
              DIVINE EMPIRE INDIA PVT LTD.
            </h6>
            <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
              <p style={{ margin: "3px 0" }}>
                Account No.: {quotationData.accountNo || "N/A"}
              </p>
              <p style={{ margin: "3px 0" }}>
                Bank Name: {quotationData.bankName || "N/A"}
              </p>
              <p style={{ margin: "3px 0" }}>
                Bank Address: {quotationData.bankAddress || "N/A"}
              </p>
              <p style={{ margin: "3px 0" }}>
                IFSC CODE: {quotationData.ifscCode || "N/A"}
              </p>
              <p style={{ margin: "3px 0" }}>
                Email: {quotationData.email || "N/A"}
              </p>
              <p style={{ margin: "3px 0" }}>
                Website: {quotationData.website || "N/A"}
              </p>
              <p style={{ margin: "3px 0" }}>
                Company PAN: {quotationData.pan || "N/A"}
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div
            style={{
              width: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "3px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <img
                src={qr}
                alt="QR Code"
                style={{
                  width: "170px",
                  height: "170px",
                  objectFit: "contain",
                }}
              />
              <p
                style={{
                  fontSize: "10px",
                  margin: "8px 0 0 0",
                  fontWeight: "bold",
                }}
              >
                Scan for Payment
              </p>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid #ddd",
            paddingTop: "16px",
            textAlign: "right",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}
        >
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Declaration:
          </h4>
          <p
            style={{
              fontSize: "11px",
              lineHeight: "1.4",
              margin: "0 0 16px 0",
            }}
          >
            We declare that this Quotation shows the actual price of the goods
            described and that all particulars are true and correct.
          </p>
          <p style={{ fontSize: "11px", margin: "16px 0" }}>
            Prepared By: {quotationData.preparedBy || "N/A"}
          </p>
          <p
            style={{
              fontSize: "9px",
              fontStyle: "italic",
              margin: "16px 0 0 0",
            }}
          >
            This Quotation is computer-generated and does not require a seal or
            signature.
          </p>
        </div>
      </div>
    </div>
  );
};

// Function to generate HTML string from React component
export const generateHTMLFromData = (
  quotationData,
  selectedReferences,
  specialDiscount,
  hiddenColumns = {},
  hiddenFields = {} // ← add करें

) => {
  const htmlString = ReactDOMServer.renderToStaticMarkup(
    React.createElement(QuotationPDFComponent, {
      quotationData,
      selectedReferences,
      specialDiscount,
      hiddenColumns,
      hiddenFields, // ← pass करें

    })
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quotation ${quotationData.quotationNo || "NBD-002"}</title>
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
        page-break-before: always !important;
        break-before: page !important;
      }
      .avoid-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: auto;
      }
      thead {
        display: table-header-group;
      }
      tbody {
        display: table-row-group;
      }
      h1, h2, h3, h4 {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      img {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      /* Prevent orphaned rows */
      tbody tr:last-child {
        page-break-after: avoid !important;
      }
    }
    @media screen {
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
    .content-section {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 10px;
    }
    .header-section {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    /* Force keep table rows together */
    table tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  </style>
</head>
<body>
  ${htmlString}
</body>
</html>`;
};

// Add this helper function before generatePDFFromData
const preloadImages = async (imageSources) => {
  const promises = imageSources.map((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        resolve(null); // Resolve with null instead of rejecting
      };
      img.src = src;
    });
  });
  return Promise.all(promises);
};

// Safe loader for html2pdf that avoids Vite/Vercel dynamic import fetch issues
const loadHtml2Pdf = async () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error(
      "PDF generation is only available in the browser environment."
    );
  }

  // If already present (from previous load), reuse it
  if (window.html2pdf) return window.html2pdf;

  // Try dynamic import first (bundled chunk). If it fails, fall back to CDN.
  try {
    const mod = await import("html2pdf.js");
    return mod.default || window.html2pdf;
  } catch (e) {
    // Fallback to CDN bundle that includes html2canvas and jsPDF
    const CDN_URL =
      "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CDN_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load html2pdf from CDN"));
      document.head.appendChild(script);
    });
    if (!window.html2pdf) {
      throw new Error("html2pdf not available after loading CDN script");
    }
    return window.html2pdf;
  }
};

// Client-side only PDF generation using safe loader
export const generatePDFFromData = async (
  quotationData,
  selectedReferences,
  specialDiscount,
  hiddenColumns = {},
  hiddenFields = {} // ← add करें
) => {
  if (typeof window === "undefined") {
    throw new Error(
      "PDF generation is only available in the browser environment. Please run this function on the client side."
    );
  }

  try {
    console.log("Starting PDF generation...");

    // Preload all images before generating PDF
    console.log("Preloading images...");
    await preloadImages([logo, maniquipLogo1, qr]);
    console.log("Images preloaded successfully");

    const html2pdf = await loadHtml2Pdf();

    const htmlString = generateHTMLFromData(
      quotationData,
      selectedReferences,
      specialDiscount,
      hiddenColumns,
      hiddenFields // ← pass करें
    );

    const options = {
      margin: [5, 0, 0, 0],
      filename: `Quotation_${quotationData.quotationNo || "NBD-002"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000, // Add timeout for images
        onclone: (clonedDoc) => {
          // Ensure images are present in cloned document
          const images = clonedDoc.getElementsByTagName("img");
          Array.from(images).forEach((img) => {
            if (!img.complete) {
              console.warn("Image not loaded:", img.src);
            }
          });
        },
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    console.log("Generating PDF with html2pdf...");
    const pdfDataUri = await html2pdf()
      .set(options)
      .from(htmlString)
      .outputPdf("datauristring");
    console.log("PDF generated successfully");
    return pdfDataUri;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

// Alternative function that returns base64 directly
export const generatePDFBase64 = async (
  quotationData,
  selectedReferences,
  specialDiscount,
  hiddenColumns = {},
  hiddenFields = {},
) => {
  try {
    const pdfDataUri = await generatePDFFromData(
      quotationData,
      selectedReferences,
      specialDiscount,
      hiddenColumns,
      hiddenFields,
    );
    const base64Data = pdfDataUri.split(",")[1];
    return base64Data;
  } catch (error) {
    console.error("Error generating PDF base64:", error);
    throw error;
  }
};

// Export the React component
export { QuotationPDFComponent };
