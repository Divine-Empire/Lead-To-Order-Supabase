import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import logo from "../../assests/WhatsApp Image 2025-05-14 at 4.11.43 PM.jpeg";
import qr from "../../assests/qrlogo.png";
import maniquipLogo1 from "../../assests/maniquip-logo-screenshot.png";

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

// Formatting helper
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

// React-PDF Stylesheet
const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 35,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.3,
    color: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
  },
  headerLogoLeft: {
    width: 50,
    height: 50,
  },
  headerLogoRight: {
    width: 120,
    height: 50,
  },
  headerCenter: {
    textAlign: "center",
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#113878",
    textAlign: "center",
  },
  companySubtitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#113878",
    textAlign: "center",
    marginTop: 8,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
  },
  titleText: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#333333",
  },
  metaTextRight: {
    textAlign: "right",
  },
  metaLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  detailsSection: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailsColumn: {
    width: "50%",
    paddingRight: 10,
  },
  detailsTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#333333",
  },
  detailsText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    lineHeight: 1.3,
  },
  detailsLabel: {
    fontFamily: "Helvetica-Bold",
  },
  billShipSection: {
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderStyle: "solid",
    marginTop: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
    alignItems: "stretch",
    minHeight: 18,
  },
  tableRowHeader: {
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 2,
    borderBottomColor: "#cccccc",
    borderBottomStyle: "solid",
  },
  tableCell: {
    padding: 3,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    justifyContent: "center",
  },
  tableCellText: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
  },
  tableCellHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
  },
  twoColSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  twoColLeft: {
    width: "48%",
  },
  twoColRight: {
    width: "48%",
  },
  twoColFull: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#333333",
  },
  taxTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderStyle: "solid",
  },
  taxRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
    alignItems: "center",
    minHeight: 16,
  },
  taxRowHeader: {
    backgroundColor: "#f8f9fa",
  },
  taxCell: {
    padding: "3px 4px",
    fontSize: 7,
    fontFamily: "Helvetica",
  },
  taxCellHeader: {
    fontFamily: "Helvetica-Bold",
  },
  amountWordsBox: {
    marginTop: 4,
  },
  amountWordsLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  amountWordsText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    textTransform: "capitalize",
  },
  grandTotalTextRight: {
    textAlign: "right",
    marginTop: 10,
  },
  grandTotalLarge: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  termsSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
  termRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  termLabel: {
    width: 120,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  termValue: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  specialOffersContainer: {
    marginTop: 10,
    backgroundColor: "#fff3e0",
    borderWidth: 1,
    borderColor: "#ffcc80",
    borderStyle: "solid",
    padding: 6,
    borderRadius: 4,
  },
  specialOffersTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#e65100",
    marginBottom: 4,
  },
  specialOfferText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    marginBottom: 2,
  },
  notesContainer: {
    marginTop: 10,
  },
  noteText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    marginBottom: 2,
  },
  bankQrSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
  qrContainer: {
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: 100,
    height: 100,
    marginBottom: 4,
  },
  qrText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  declarationSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    borderTopStyle: "solid",
    paddingTop: 10,
    alignItems: "flex-end",
  },
  declarationTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  declarationText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    textAlign: "right",
    maxWidth: "80%",
    lineHeight: 1.3,
  },
  declarationPrepared: {
    fontSize: 8,
    fontFamily: "Helvetica",
    marginTop: 8,
    marginBottom: 8,
  },
  declarationNote: {
    fontSize: 7,
    fontFamily: "Helvetica-Oblique",
    color: "#666666",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 8,
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#999999",
  },
});

const colStyles = {
  "S No.": { width: "5%", textAlign: "center" },
  "Code": { width: "8%", textAlign: "left" },
  "Product Name": { width: "20%", textAlign: "left" },
  "Description": { width: "27%", flexGrow: 1, textAlign: "left" },
  "GST %": { width: "6%", textAlign: "center" },
  "Qty": { width: "5%", textAlign: "center" },
  "Units": { width: "6%", textAlign: "center" },
  "Rate": { width: "8%", textAlign: "right" },
  "Disc %": { width: "6%", textAlign: "center" },
  "Flat Disc": { width: "8%", textAlign: "right" },
  "Amount": { width: "11%", textAlign: "right" },
};

// React PDF Document Component
const QuotationPDFDocument = ({
  quotationData = {},
  selectedReferences = [],
  specialDiscount = 0,
  hiddenColumns = {},
  hiddenFields = {},
}) => {
  const displayedQuotationNo =
    (quotationData &&
      (quotationData.Quotation_No || quotationData.finalQuotationNo)) ||
    quotationData?.quotationNo ||
    "NBD-002";

  // Financial calculations
  const subtotal = quotationData.subtotal || 0;
  const totalFlatDiscount = quotationData.totalFlatDiscount || 0;

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

    if (
      typeof quotationData.date === "string" &&
      quotationData.date.includes("/")
    ) {
      const [day, month, year] = quotationData.date.split("/");
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }

    try {
      return new Date(quotationData.date).toLocaleDateString("en-GB");
    } catch (error) {
      return new Date().toLocaleDateString("en-GB");
    }
  })();

  // Build table headers list based on hidden columns
  const tableHeaders = ["S No."];
  if (!hiddenColumns?.hideCode) tableHeaders.push("Code");
  if (!hiddenColumns?.hideProductName) tableHeaders.push("Product Name");
  if (!hiddenColumns?.hideDescription) tableHeaders.push("Description");
  if (!hiddenColumns?.hideGST) tableHeaders.push("GST %");
  if (!hiddenColumns?.hideQty) tableHeaders.push("Qty");
  if (!hiddenColumns?.hideUnits) tableHeaders.push("Units");
  if (!hiddenColumns?.hideRate) tableHeaders.push("Rate");
  if (!hiddenColumns?.hideDisc) tableHeaders.push("Disc %");
  if (!hiddenColumns?.hideFlatDisc) tableHeaders.push("Flat Disc");
  if (!hiddenColumns?.hideAmount) tableHeaders.push("Amount");

  const items = quotationData.items || [];

  // Summary Row sizing logic
  const lastHeader = tableHeaders[tableHeaders.length - 1];
  const lastColStyle = colStyles[lastHeader] || { width: "11%", textAlign: "right" };
  const lastColWidthVal = parseFloat(lastColStyle.width) || 11;
  const labelColWidth = `${100 - lastColWidthVal}%`;

  const showTaxBreakdown =
    (quotationData.isIGST && !hiddenColumns?.hideIGST) ||
    (!quotationData.isIGST &&
      !hiddenColumns?.hideCGST &&
      !hiddenColumns?.hideSGST);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image src={logo} style={styles.headerLogoLeft} />
          <View style={styles.headerCenter}>
            <Text style={styles.companyName}>DIVINE EMPIRE INDIA</Text>
            <Text style={styles.companySubtitle}>( PVT. LTD. )</Text>
          </View>
          <Image src={maniquipLogo1} style={styles.headerLogoRight} />
        </View>

        {/* Title and Metadata */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>QUOTATION</Text>
          <View style={styles.metaTextRight}>
            <Text style={styles.metaLabel}>
              Quo No: <Text style={styles.metaValue}>{displayedQuotationNo}</Text>
            </Text>
            <Text style={styles.metaLabel}>
              Date: <Text style={styles.metaValue}>{dateStr}</Text>
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection} wrap={false}>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailsTitle}>Consignor Details</Text>
            <Text style={[styles.detailsText, { fontFamily: "Helvetica-Bold" }]}>
              DIVINE EMPIRE INDIA( PVT. LTD. )
            </Text>
            {selectedReferences && selectedReferences.length > 0 && (
              <Text style={styles.detailsText}>{selectedReferences.join(", ")}</Text>
            )}
            <Text style={styles.detailsText}>{quotationData.consignorAddress || " "}</Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Mobile: </Text>
              {quotationData.consignorMobile || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Phone: </Text>0772-400515
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>GSTIN: </Text>
              {quotationData.consignorGSTIN || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>State Code: </Text>
              {quotationData.consignorStateCode || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>MSME Number: </Text>
              {quotationData.msmeNumber || " "}
            </Text>
          </View>

          <View style={styles.detailsColumn}>
            <Text style={styles.detailsTitle}>Consignee Details</Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Company Name: </Text>
              {quotationData.consigneeName || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Contact Name: </Text>
              {quotationData.consigneeContactName || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Contact No.: </Text>
              {quotationData.consigneeContactNo || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>State: </Text>
              {quotationData.consigneeState || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>GSTIN: </Text>
              {quotationData.consigneeGSTIN || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>State Code: </Text>
              {quotationData.consigneeStateCode || " "}
            </Text>
          </View>
        </View>

        {/* Bill To & Ship To */}
        <View style={styles.billShipSection} wrap={false}>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailsTitle}>Bill To</Text>
            <Text style={styles.detailsText}>{quotationData.consigneeAddress || " "}</Text>
          </View>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailsTitle}>Ship To</Text>
            <Text style={styles.detailsText}>{quotationData.shipTo || " "}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableRowHeader]} fixed>
            {tableHeaders.map((header) => (
              <View
                key={header}
                style={[
                  styles.tableCell,
                  {
                    width: colStyles[header].width,
                    flexGrow: colStyles[header].flexGrow,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tableCellHeaderText,
                    { textAlign: colStyles[header].textAlign },
                  ]}
                >
                  {header}
                </Text>
              </View>
            ))}
          </View>

          {/* Data Rows */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: colStyles["S No."].width }]}>
                <Text
                  style={[
                    styles.tableCellText,
                    { textAlign: colStyles["S No."].textAlign },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              {!hiddenColumns?.hideCode && (
                <View style={[styles.tableCell, { width: colStyles["Code"].width }]}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["Code"].textAlign },
                    ]}
                  >
                    {item.code || " "}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideProductName && (
                <View style={[styles.tableCell, { width: colStyles["Product Name"].width }]}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["Product Name"].textAlign },
                    ]}
                  >
                    {item.name || " "}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideDescription && (
                <View
                  style={[
                    styles.tableCell,
                    {
                      width: colStyles["Description"].width,
                      flexGrow: colStyles["Description"].flexGrow,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["Description"].textAlign },
                    ]}
                  >
                    {item.description || " "}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideGST && (
                <View style={[styles.tableCell, { width: colStyles["GST %"].width }]}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["GST %"].textAlign },
                    ]}
                  >
                    {item.gst || 18}%
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideQty && (
                <View style={[styles.tableCell, { width: colStyles["Qty"].width }]}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["Qty"].textAlign },
                    ]}
                  >
                    {Number(item.qty) || 1}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideUnits && (
                <View style={[styles.tableCell, { width: colStyles["Units"].width }]}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["Units"].textAlign },
                    ]}
                  >
                    {item.units || "Nos"}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideRate && (
                <View style={[styles.tableCell, { width: colStyles["Rate"].width }]}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["Rate"].textAlign },
                    ]}
                  >
                    Rs. {formatCurrency(item.rate || 0)}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideDisc && (
                <View style={[styles.tableCell, { width: colStyles["Disc %"].width }]}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["Disc %"].textAlign },
                    ]}
                  >
                    {item.discount || 0}%
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideFlatDisc && (
                <View style={[styles.tableCell, { width: colStyles["Flat Disc"].width }]}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["Flat Disc"].textAlign },
                    ]}
                  >
                    Rs. {formatCurrency(item.flatDiscount || 0)}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideAmount && (
                <View style={[styles.tableCell, { width: colStyles["Amount"].width }]}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { textAlign: colStyles["Amount"].textAlign },
                    ]}
                  >
                    Rs. {formatCurrency(item.amount || 0)}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Empty fallback row */}
          {items.length === 0 && (
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: colStyles["S No."].width }]}>
                <Text
                  style={[
                    styles.tableCellText,
                    { textAlign: colStyles["S No."].textAlign },
                  ]}
                >
                  1
                </Text>
              </View>
              {!hiddenColumns?.hideCode && (
                <View style={[styles.tableCell, { width: colStyles["Code"].width }]}>
                  <Text style={[styles.tableCellText, { textAlign: colStyles["Code"].textAlign }]}>
                    {" "}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideProductName && (
                <View style={[styles.tableCell, { width: colStyles["Product Name"].width }]}>
                  <Text style={[styles.tableCellText, { textAlign: colStyles["Product Name"].textAlign }]}>
                    {" "}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideDescription && (
                <View
                  style={[
                    styles.tableCell,
                    {
                      width: colStyles["Description"].width,
                      flexGrow: colStyles["Description"].flexGrow,
                    },
                  ]}
                >
                  <Text style={[styles.tableCellText, { textAlign: colStyles["Description"].textAlign }]}>
                    {" "}
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideGST && (
                <View style={[styles.tableCell, { width: colStyles["GST %"].width }]}>
                  <Text style={[styles.tableCellText, { textAlign: colStyles["GST %"].textAlign }]}>
                    18%
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideQty && (
                <View style={[styles.tableCell, { width: colStyles["Qty"].width }]}>
                  <Text style={[styles.tableCellText, { textAlign: colStyles["Qty"].textAlign }]}>
                    1
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideUnits && (
                <View style={[styles.tableCell, { width: colStyles["Units"].width }]}>
                  <Text style={[styles.tableCellText, { textAlign: colStyles["Units"].textAlign }]}>
                    Nos
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideRate && (
                <View style={[styles.tableCell, { width: colStyles["Rate"].width }]}>
                  <Text style={[styles.tableCellText, { textAlign: colStyles["Rate"].textAlign }]}>
                    Rs. 0.00
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideDisc && (
                <View style={[styles.tableCell, { width: colStyles["Disc %"].width }]}>
                  <Text style={[styles.tableCellText, { textAlign: colStyles["Disc %"].textAlign }]}>
                    0%
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideFlatDisc && (
                <View style={[styles.tableCell, { width: colStyles["Flat Disc"].width }]}>
                  <Text style={[styles.tableCellText, { textAlign: colStyles["Flat Disc"].textAlign }]}>
                    Rs. 0.00
                  </Text>
                </View>
              )}
              {!hiddenColumns?.hideAmount && (
                <View style={[styles.tableCell, { width: colStyles["Amount"].width }]}>
                  <Text style={[styles.tableCellText, { textAlign: colStyles["Amount"].textAlign }]}>
                    Rs. 0.00
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Subtotal */}
          {!hiddenColumns?.hideSubtotal && (
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: labelColWidth }]}>
                <Text style={[styles.tableCellHeaderText, { textAlign: "right" }]}>
                  Subtotal
                </Text>
              </View>
              <View style={[styles.tableCell, { width: lastColStyle.width }]}>
                <Text
                  style={[
                    styles.tableCellHeaderText,
                    { textAlign: lastColStyle.textAlign },
                  ]}
                >
                  Rs. {formatCurrency(subtotal)}
                </Text>
              </View>
            </View>
          )}

          {/* Total Qty */}
          {!hiddenColumns?.hideTotalQty && (
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: labelColWidth }]}>
                <Text style={[styles.tableCellText, { textAlign: "right" }]}>Total Qty</Text>
              </View>
              <View style={[styles.tableCell, { width: lastColStyle.width }]}>
                <Text
                  style={[
                    styles.tableCellText,
                    { textAlign: lastColStyle.textAlign },
                  ]}
                >
                  {items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)}
                </Text>
              </View>
            </View>
          )}

          {/* Total Flat Discount */}
          {!hiddenColumns.hideTotalFlatDisc && totalFlatDiscount > 0 && (
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: labelColWidth }]}>
                <Text style={[styles.tableCellText, { textAlign: "right" }]}>
                  Total Flat Discount
                </Text>
              </View>
              <View style={[styles.tableCell, { width: lastColStyle.width }]}>
                <Text
                  style={[
                    styles.tableCellText,
                    { textAlign: lastColStyle.textAlign },
                  ]}
                >
                  -Rs. {formatCurrency(totalFlatDiscount)}
                </Text>
              </View>
            </View>
          )}

          {/* Special Discount */}
          {!hiddenColumns.hideSpecialDiscount && Number(specialDiscount) > 0 && (
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: labelColWidth }]}>
                <Text style={[styles.tableCellText, { textAlign: "right" }]}>
                  Special Discount
                </Text>
              </View>
              <View style={[styles.tableCell, { width: lastColStyle.width }]}>
                <Text
                  style={[
                    styles.tableCellText,
                    { textAlign: lastColStyle.textAlign },
                  ]}
                >
                  Rs. {formatCurrency(Number(specialDiscount) || 0)}
                </Text>
              </View>
            </View>
          )}

          {/* Grand Total */}
          {!hiddenColumns?.hideGrandTotal && (
            <View style={[styles.tableRow, { backgroundColor: "#e6f3ff" }]} wrap={false}>
              <View style={[styles.tableCell, { width: labelColWidth }]}>
                <Text style={[styles.tableCellHeaderText, { textAlign: "right" }]}>
                  Grand Total
                </Text>
              </View>
              <View style={[styles.tableCell, { width: lastColStyle.width }]}>
                <Text
                  style={[
                    styles.tableCellHeaderText,
                    { textAlign: lastColStyle.textAlign },
                  ]}
                >
                  Rs. {formatCurrency(grandTotal)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Tax Breakdown & Amount in Words */}
        <View style={styles.twoColSection} wrap={false}>
          {showTaxBreakdown ? (
            <>
              <View style={styles.twoColLeft}>
                <Text style={styles.sectionTitle}>Tax Breakdown</Text>
                <View style={styles.taxTable}>
                  <View style={[styles.taxRow, styles.taxRowHeader]}>
                    <View style={[styles.taxCell, { width: "40%" }]}>
                      <Text style={styles.taxCellHeader}>Tax Type</Text>
                    </View>
                    <View style={[styles.taxCell, { width: "25%" }]}>
                      <Text style={styles.taxCellHeader}>Rate</Text>
                    </View>
                    <View style={[styles.taxCell, { width: "35%", textAlign: "right" }]}>
                      <Text style={styles.taxCellHeader}>Amount</Text>
                    </View>
                  </View>

                  {/* IGST breakdown */}
                  {quotationData.isIGST && !hiddenColumns?.hideIGST && (
                    <>
                      {Object.entries(quotationData.igstBreakdown || {}).map(
                        ([rate, value]) => (
                          <View key={`igst-${rate}`} style={styles.taxRow}>
                            <View style={[styles.taxCell, { width: "40%" }]}>
                              <Text>IGST</Text>
                            </View>
                            <View style={[styles.taxCell, { width: "25%" }]}>
                              <Text>{Number(rate)}%</Text>
                            </View>
                            <View
                              style={[
                                styles.taxCell,
                                { width: "35%", textAlign: "right" },
                              ]}
                            >
                              <Text>Rs. {formatCurrency(Number(value))}</Text>
                            </View>
                          </View>
                        )
                      )}
                      <View style={[styles.taxRow, { backgroundColor: "#f8f9fa" }]}>
                        <View style={[styles.taxCell, { width: "40%" }]}>
                          <Text style={styles.taxCellHeader}>IGST Total</Text>
                        </View>
                        <View style={[styles.taxCell, { width: "25%" }]}>
                          <Text style={styles.taxCellHeader}>
                            {quotationData.igstRate || 18}%
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.taxCell,
                            { width: "35%", textAlign: "right" },
                          ]}
                        >
                          <Text style={styles.taxCellHeader}>
                            Rs. {formatCurrency(igstAmount)}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}

                  {/* CGST & SGST breakdowns */}
                  {!quotationData.isIGST && (
                    <>
                      {!hiddenColumns?.hideCGST && (
                        <>
                          {Object.entries(quotationData.cgstBreakdown || {}).map(
                            ([rate, value]) => (
                              <View key={`cgst-${rate}`} style={styles.taxRow}>
                                <View style={[styles.taxCell, { width: "40%" }]}>
                                  <Text>CGST</Text>
                                </View>
                                <View style={[styles.taxCell, { width: "25%" }]}>
                                  <Text>{Number(rate)}%</Text>
                                </View>
                                <View
                                  style={[
                                    styles.taxCell,
                                    { width: "35%", textAlign: "right" },
                                  ]}
                                >
                                  <Text>Rs. {formatCurrency(Number(value))}</Text>
                                </View>
                              </View>
                            )
                          )}
                          <View
                            style={[
                              styles.taxRow,
                              { backgroundColor: "#f8f9fa" },
                            ]}
                          >
                            <View style={[styles.taxCell, { width: "40%" }]}>
                              <Text style={styles.taxCellHeader}>CGST Total</Text>
                            </View>
                            <View style={[styles.taxCell, { width: "25%" }]}>
                              <Text style={styles.taxCellHeader}>
                                {quotationData.cgstRate || 9}%
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.taxCell,
                                { width: "35%", textAlign: "right" },
                              ]}
                            >
                              <Text style={styles.taxCellHeader}>
                                Rs. {formatCurrency(cgstAmount)}
                              </Text>
                            </View>
                          </View>
                        </>
                      )}

                      {!hiddenColumns?.hideSGST && (
                        <>
                          {Object.entries(quotationData.sgstBreakdown || {}).map(
                            ([rate, value]) => (
                              <View key={`sgst-${rate}`} style={styles.taxRow}>
                                <View style={[styles.taxCell, { width: "40%" }]}>
                                  <Text>SGST</Text>
                                </View>
                                <View style={[styles.taxCell, { width: "25%" }]}>
                                  <Text>{Number(rate)}%</Text>
                                </View>
                                <View
                                  style={[
                                    styles.taxCell,
                                    { width: "35%", textAlign: "right" },
                                  ]}
                                >
                                  <Text>Rs. {formatCurrency(Number(value))}</Text>
                                </View>
                              </View>
                            )
                          )}
                          <View
                            style={[
                              styles.taxRow,
                              { backgroundColor: "#f8f9fa" },
                            ]}
                          >
                            <View style={[styles.taxCell, { width: "40%" }]}>
                              <Text style={styles.taxCellHeader}>SGST Total</Text>
                            </View>
                            <View style={[styles.taxCell, { width: "25%" }]}>
                              <Text style={styles.taxCellHeader}>
                                {quotationData.sgstRate || 9}%
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.taxCell,
                                { width: "35%", textAlign: "right" },
                              ]}
                            >
                              <Text style={styles.taxCellHeader}>
                                Rs. {formatCurrency(sgstAmount)}
                              </Text>
                            </View>
                          </View>
                        </>
                      )}
                    </>
                  )}
                </View>
              </View>

              <View style={styles.twoColRight}>
                {!hiddenColumns?.hideGrandTotal && (
                  <View style={styles.amountWordsBox}>
                    <Text style={styles.amountWordsLabel}>
                      Amount Chargeable (in words)
                    </Text>
                    <Text style={styles.amountWordsText}>
                      {Number(grandTotal) > 0
                        ? numberToWords(grandTotal)
                        : "Zero"}{" "}
                      Only
                    </Text>
                    <View style={styles.grandTotalTextRight}>
                      <Text style={styles.grandTotalLarge}>
                        Grand Total: Rs. {formatCurrency(grandTotal)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.twoColFull}>
              {!hiddenColumns?.hideGrandTotal && (
                <View style={styles.amountWordsBox}>
                  <Text style={styles.amountWordsLabel}>
                    Amount Chargeable (in words)
                  </Text>
                  <Text style={styles.amountWordsText}>
                    {Number(grandTotal) > 0
                      ? numberToWords(grandTotal)
                      : "Zero"}{" "}
                    Only
                  </Text>
                  <View style={styles.grandTotalTextRight}>
                    <Text style={styles.grandTotalLarge}>
                      Grand Total: Rs. {formatCurrency(grandTotal)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsSection} wrap={false}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          {!hiddenFields?.validity && (
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Validity</Text>
              <Text style={styles.termValue}>
                {quotationData.validity ||
                  "The above quoted prices are valid up to 10 days from date of offer."}
              </Text>
            </View>
          )}
          {!hiddenFields?.paymentTerms && (
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Payment Terms</Text>
              <Text style={styles.termValue}>
                {quotationData.paymentTerms ||
                  "100% advance payment in the mode of NEFT, RTGS & DD. Payment only accepted in company's account – DIVINE EMPIRE INDIA PVT LTD."}
              </Text>
            </View>
          )}
          {!hiddenFields?.delivery && (
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Delivery</Text>
              <Text style={styles.termValue}>
                {quotationData.delivery ||
                  "Within 7-10 working days after received purchase order and 100% advance payment"}
              </Text>
            </View>
          )}
          {!hiddenFields?.freight && (
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Freight</Text>
              <Text style={styles.termValue}>
                {quotationData.freight || "Extra as per actual."}
              </Text>
            </View>
          )}
          {!hiddenFields?.warranty && (
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Warranty</Text>
              <Text style={styles.termValue}>
                {quotationData.warranty ||
                  "6 months warranty applicable against Manufacturing defects."}
              </Text>
            </View>
          )}
          {!hiddenFields?.taxes && (
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Taxes</Text>
              <Text style={styles.termValue}>
                {quotationData.taxes || "Extra mentioned in the quotation."}
              </Text>
            </View>
          )}
          {!hiddenFields?.insurance && (
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Insurance</Text>
              <Text style={styles.termValue}>
                {quotationData.insurance ||
                  "Transit insurance for all shipment is at Buyer's scope."}
              </Text>
            </View>
          )}
          {!hiddenFields?.afterReceiptOfMaterial && (
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>After Receipt of Material</Text>
              <Text style={styles.termValue}>
                {quotationData.afterReceiptOfMaterial ||
                  "In case of any discrepancy in the material, please inform us within 24 hours with supporting images attached. After this period, the company will not be responsible for any discrepancies."}
              </Text>
            </View>
          )}
          {!hiddenFields?.technicalSupport && (
            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Technical Support</Text>
              <Text style={styles.termValue}>
                {quotationData.technicalSupport ||
                  "Video call assistance for installation and troubleshooting of the machine is FOC. For physical assistance: Service charges are free during the warranty period; however, TA & DA will be charged extra as per actuals."}
              </Text>
            </View>
          )}
        </View>

        {/* Special Anniversary Offers */}
        {quotationData.specialOffers &&
          quotationData.specialOffers.filter((offer) => offer.trim()).length > 0 && (
            <View style={styles.specialOffersContainer} wrap={false}>
              <Text style={styles.specialOffersTitle}>
                Divine Empire's 10th Anniversary Special Offer
              </Text>
              {quotationData.specialOffers
                .filter((offer) => offer.trim())
                .map((offer, index) => (
                  <Text key={index} style={styles.specialOfferText}>
                    • {offer}
                  </Text>
                ))}
            </View>
          )}

        {/* Notes Section */}
        {quotationData.notes &&
          quotationData.notes.filter((note) => note.trim()).length > 0 && (
            <View style={styles.notesContainer} wrap={false}>
              <Text style={styles.sectionTitle}>Notes</Text>
              {quotationData.notes
                .filter((note) => note.trim())
                .map((note, index) => (
                  <Text key={index} style={styles.noteText}>
                    {index + 1}. {note}
                  </Text>
                ))}
            </View>
          )}

        {/* Bank Details and QR Code */}
        <View style={styles.bankQrSection} wrap={false}>
          <View style={styles.twoColLeft}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            <Text style={[styles.detailsText, { fontFamily: "Helvetica-Bold", marginBottom: 2 }]}>
              DIVINE EMPIRE INDIA PVT LTD.
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Account No.: </Text>
              {quotationData.accountNo || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Bank Name: </Text>
              {quotationData.bankName || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Bank Address: </Text>
              {quotationData.bankAddress || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>IFSC CODE: </Text>
              {quotationData.ifscCode || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Email: </Text>
              {quotationData.email || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Website: </Text>
              {quotationData.website || " "}
            </Text>
            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Company PAN: </Text>
              {quotationData.pan || " "}
            </Text>
          </View>
          <View style={styles.qrContainer}>
            <Image src={qr} style={styles.qrImage} />
            <Text style={styles.qrText}>Scan for Payment</Text>
          </View>
        </View>

        {/* Declaration */}
        <View style={styles.declarationSection} wrap={false}>
          <Text style={styles.declarationTitle}>Declaration:</Text>
          <Text style={styles.declarationText}>
            We declare that this Quotation shows the actual price of the goods
            described and that all particulars are true and correct.
          </Text>
          <Text style={styles.declarationPrepared}>
            Prepared By: {quotationData.preparedBy || " "}
          </Text>
          <Text style={styles.declarationNote}>
            This Quotation is computer-generated and does not require a seal or
            signature.
          </Text>
        </View>

        {/* Footer Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

// Client-side only PDF generation using @react-pdf/renderer
export const generatePDFFromData = async (
  quotationData,
  selectedReferences,
  specialDiscount,
  hiddenColumns = {},
  hiddenFields = {}
) => {
  if (typeof window === "undefined") {
    throw new Error(
      "PDF generation is only available in the browser environment. Please run this function on the client side."
    );
  }

  try {
    console.log("Starting PDF generation with @react-pdf/renderer...");

    const doc = (
      <QuotationPDFDocument
        quotationData={quotationData}
        selectedReferences={selectedReferences}
        specialDiscount={specialDiscount}
        hiddenColumns={hiddenColumns}
        hiddenFields={hiddenFields}
      />
    );

    // Render document to blob
    const blob = await pdf(doc).toBlob();

    // Convert blob to Data URI (base64)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(
          new Error("Failed to convert PDF blob to data URI: " + error.message)
        );
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error generating PDF with @react-pdf/renderer:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

// Alternative function that returns base64 directly
export const generatePDFBase64 = async (
  quotationData,
  selectedReferences,
  specialDiscount,
  hiddenColumns = {},
  hiddenFields = {}
) => {
  try {
    const pdfDataUri = await generatePDFFromData(
      quotationData,
      selectedReferences,
      specialDiscount,
      hiddenColumns,
      hiddenFields
    );
    const base64Data = pdfDataUri.split(",")[1];
    return base64Data;
  } catch (error) {
    console.error("Error generating PDF base64:", error);
    throw error;
  }
};

// Export the component and document names (maintaining exports for backwards-compatibility)
export { QuotationPDFDocument, QuotationPDFDocument as QuotationPDFComponent };
