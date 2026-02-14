"use client";

import { useState, useEffect } from "react";
import { DownloadIcon, SaveIcon, ShareIcon } from "../../components/Icons";
import image1 from "../../assests/WhatsApp Image 2025-05-14 at 4.11.43 PM.jpeg";
import imageform from "../../assests/banner.jpeg";
import QuotationHeader from "./quotation-header";
import QuotationForm from "./quotation-form";
import QuotationPreview from "./quotation-preview";
import { generatePDFFromData } from "./pdf-generator";
import { getNextQuotationNumber } from "./quotation-service";
import { useQuotationData } from "./use-quotation-data";
import supabase from "../../utils/supabase";

function Quotation() {
  const [activeTab, setActiveTab] = useState("edit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quotationLink, setQuotationLink] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isRevising, setIsRevising] = useState(false);
  const [existingQuotations, setExistingQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState("");
  const [isLoadingQuotation, setIsLoadingQuotation] = useState(false);
  const [specialDiscount, setSpecialDiscount] = useState(0);
  const [selectedReferences, setSelectedReferences] = useState([]);

  // Add hidden columns state
  const [hiddenColumns, setHiddenColumns] = useState({
    hideDisc: false,
    hideFlatDisc: false,
    hideTotalFlatDisc: false,
    hideSpecialDiscount: false,
  });

  // Helper function to convert date format
  const convertDateToISO = (dateString) => {
    if (!dateString) return null;

    // If already in ISO format (YYYY-MM-DD), return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If in DD/MM/YYYY format, convert to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // Try to parse as Date object and convert
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
      }
    } catch (error) {
      console.error("Error converting date:", error);
    }

    return null;
  };

  // Helper function to upload PDF to Supabase bucket
  const uploadPDFToSupabase = async (pdfBlob, fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from("quotation_image")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true, // This will overwrite if file exists
        });

      if (error) {
        console.error("Error uploading PDF:", error);
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("quotation_image")
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error in PDF upload:", error);
      throw error;
    }
  };

  // Check if we're in view mode
  const params = new URLSearchParams(window.location.search);
  const isViewMode = params.has("view");

  // Use the custom hook for quotation data
  const {
    quotationData,
    setQuotationData,
    handleInputChange,
    handleItemChange,
    handleFlatDiscountChange,
    handleSpecialDiscountChange,
    handleAddItem,
    handleNoteChange,
    addNote,
    removeNote,
    hiddenFields,
    toggleFieldVisibility,
    addSpecialOffer,
    removeSpecialOffer,
    handleSpecialOfferChange,
  } = useQuotationData(specialDiscount);

  const handleSpecialDiscountChangeWrapper = (value) => {
    const discount = Number(value) || 0;
    setSpecialDiscount(discount);
    handleSpecialDiscountChange(discount);
  };

  // Fetch existing quotations from Supabase
  useEffect(() => {
    const fetchExistingQuotations = async () => {
      try {
        console.log("Fetching existing quotations...");
        const { data, error } = await supabase
          .from("Make_Quotation")
          .select("Quotation_No")
          .order("Timestamp", { ascending: false });

        if (error) {
          console.error("Error fetching quotation numbers:", error);
          setExistingQuotations([]);
          return;
        }

        const quotationNumbers = data
          ? data.map((row) => row.Quotation_No).filter(Boolean)
          : [];
        setExistingQuotations(quotationNumbers);
      } catch (error) {
        console.error("Error fetching quotation numbers:", error);
        setExistingQuotations([]);
      }
    };

    fetchExistingQuotations();

    if (isRevising) {
      fetchExistingQuotations();
    }
  }, [isRevising]);

  // Initialize quotation number
  // Initialize quotation number - RUN ONLY ONCE
  useEffect(() => {
    const initializeQuotationNumber = async () => {
      try {
        const nextQuotationNumber = await getNextQuotationNumber();
        setQuotationData((prev) => ({
          ...prev,
          quotationNo: nextQuotationNumber,
        }));
      } catch (error) {
        console.error("Error initializing quotation number:", error);
      }
    };

    initializeQuotationNumber();
  }, []); // ← Empty dependency array to run only once

  // Load quotation data from URL if in view mode
  useEffect(() => {
    const viewId = params.get("view");

    if (viewId) {
      const savedQuotation = localStorage.getItem(viewId);

      if (savedQuotation) {
        try {
          const parsedData = JSON.parse(savedQuotation);
          setQuotationData(parsedData);
          setActiveTab("preview");
        } catch (error) {
          console.error("Error loading quotation data:", error);
        }
      }
    }
  }, [setQuotationData]);

  const toggleRevising = () => {
    const newIsRevising = !isRevising;
    setIsRevising(newIsRevising);

    if (newIsRevising) {
      setSelectedQuotation("");
    }
  };

  const handleQuotationSelect = async (quotationNo) => {
    if (!quotationNo) return;

    setIsLoadingQuotation(true);
    setSelectedQuotation(quotationNo);

    try {
      const { data, error } = await supabase
        .from("Make_Quotation")
        .select("*")
        .eq("Quotation_No", quotationNo)
        .single();

      if (error) {
        console.error("Error fetching quotation data:", error);
        alert("Failed to load quotation data");
        return;
      }

      if (data) {
        const loadedData = data;

        const references = loadedData.Reference_Name
          ? loadedData.Reference_Name.split(",")
            .map((r) => r.trim())
            .filter((r) => r)
          : [];
        setSelectedReferences(references);

        let items = [];
        const specialDiscountFromItems = 0; // Will be calculated from items if needed

        if (
          loadedData.Items &&
          Array.isArray(loadedData.Items) &&
          loadedData.Items.length > 0
        ) {
          items = loadedData.Items.map((item, index) => ({
            id: index + 1,
            ...item,
          }));
        }

        const subtotal = items.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        );
        const totalFlatDiscount = 0; // Calculate from items if needed
        const cgstRate = 9;
        const sgstRate = 9;
        const taxableAmount = Math.max(0, subtotal - totalFlatDiscount);
        const cgstAmount = Number(
          (taxableAmount * (cgstRate / 100)).toFixed(2)
        );
        const sgstAmount = Number(
          (taxableAmount * (sgstRate / 100)).toFixed(2)
        );
        const total = Number(
          (
            taxableAmount +
            cgstAmount +
            sgstAmount -
            specialDiscountFromItems
          ).toFixed(2)
        );

        // Parse special offers from loaded data
        let specialOffers = [""];
        if (loadedData.Divine_Empire_10th_Anniversary_Special_Offer) {
          if (
            typeof loadedData.Divine_Empire_10th_Anniversary_Special_Offer ===
            "string"
          ) {
            specialOffers =
              loadedData.Divine_Empire_10th_Anniversary_Special_Offer.split(
                "|"
              ).filter((offer) => offer.trim());
            if (specialOffers.length === 0) specialOffers = [""];
          } else if (
            Array.isArray(
              loadedData.Divine_Empire_10th_Anniversary_Special_Offer
            )
          ) {
            specialOffers =
              loadedData.Divine_Empire_10th_Anniversary_Special_Offer;
          }
        }

        setQuotationData({
          quotationNo: loadedData.Quotation_No || "",
          date: loadedData.Quotation_Date || "",
          preparedBy: loadedData.Prepared_By || "",
          consignorState: loadedData.Consigner_State || "",
          consignorName: loadedData.Reference_Name || "",
          consignorAddress: loadedData.Address || "",
          consignorMobile: loadedData.Mobile || "",
          consignorPhone: loadedData.Phone || "",
          consignorGSTIN: loadedData.GSTIN || "",
          consignorStateCode: loadedData.State_Code || "",
          consigneeName: loadedData.Company_Name || "",
          consigneeAddress: loadedData.Consignee_Address || "",
          shipTo: loadedData.Ship_To || "",
          consigneeState: loadedData.State || "",
          consigneeContactName: loadedData.Contact_Name || "",
          consigneeContactNo: loadedData.Contact_No || "",
          consigneeGSTIN: loadedData.Consignee_GSTIN || "",
          consigneeStateCode: loadedData.Consignee_State_Code || "",
          msmeNumber: loadedData.MSME_No || "",
          validity: loadedData.Validity || "",
          paymentTerms: loadedData.Payment_Terms || "",
          delivery: loadedData.Delivery || "",
          freight: loadedData.Freight || "",
          insurance: loadedData.Insurance || "",
          taxes: loadedData.Taxes || "",
          accountNo: loadedData.Account_No || "",
          bankName: loadedData.Bank_Name || "",
          bankAddress: loadedData.Bank_Address || "",
          ifscCode: loadedData.IFSC_Code || "",
          email: loadedData.Email || "",
          website: loadedData.Website || "",
          pan: loadedData.Pan || "",
          items,
          subtotal,
          totalFlatDiscount,
          cgstRate,
          sgstRate,
          cgstAmount,
          sgstAmount,
          total,
          specialOffers: specialOffers,
          notes: loadedData.Notes
            ? loadedData.Notes.split("|").filter((note) => note.trim())
            : [""],
        });

        setSpecialDiscount(specialDiscountFromItems);

        handleSpecialDiscountChangeWrapper(specialDiscountFromItems);
        handleInputChange("consignorState", loadedData.Consigner_State || "");
        handleInputChange("consigneeState", loadedData.State || "");
        handleInputChange("items", items);
      }
    } catch (error) {
      console.error("Error fetching quotation data:", error);
      alert("Failed to load quotation data");
    } finally {
      setIsLoadingQuotation(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      // Prefer backend number if present, otherwise fall back
      const preferredNo =
        quotationData.Quotation_No ||
        quotationData.finalQuotationNo ||
        quotationData.quotationNo;

      const pdfDataUri = await generatePDFFromData(
        { ...quotationData, Quotation_No: preferredNo },
        selectedReferences,
        specialDiscount,
        hiddenColumns,
        hiddenFields
      );

      // Extract base64 data from data URI
      const base64Data = pdfDataUri.split(",")[1];

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Quotation_${preferredNo}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(link.href);

      setIsGenerating(false);
      alert("PDF generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF: " + error.message);
      setIsGenerating(false);
    }
  };

  const handleGenerateLink = async () => {
    setIsGenerating(true);

    try {
      // Create local storage link for your reference
      const quotationId = `quotation_${Date.now()}`;
      localStorage.setItem(quotationId, JSON.stringify(quotationData));
      const localLink = `${window.location.origin}${window.location.pathname}?view=${quotationId}`;

      setQuotationLink(localLink);
      setIsGenerating(false);

      alert(
        "Quotation link has been successfully generated and is ready to share."
      );
    } catch (error) {
      console.error("Error generating link:", error);
      alert("Failed to generate link: " + error.message);
      setIsGenerating(false);
    }
  };

  const handleSaveQuotation = async () => {
    if (!quotationData.consigneeName) {
      alert("Please select a company name");
      return;
    }

    if (!quotationData.preparedBy) {
      alert("Please enter prepared by name");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate grand total
      const taxableAmount = Math.max(
        0,
        quotationData.subtotal - quotationData.totalFlatDiscount
      );
      let grandTotal = 0;

      if (quotationData.isIGST) {
        const igstAmt = taxableAmount * (quotationData.igstRate / 100);
        grandTotal = taxableAmount + igstAmt - (Number(specialDiscount) || 0);
      } else {
        const cgstAmt = taxableAmount * (quotationData.cgstRate / 100);
        const sgstAmt = taxableAmount * (quotationData.sgstRate / 100);
        grandTotal =
          taxableAmount + cgstAmt + sgstAmt - (Number(specialDiscount) || 0);
      }

      const finalGrandTotal = Math.max(0, grandTotal).toFixed(2);

      // Helper to create next revision value based on a base number
      const nextRevision = (baseNo) => {
        const parts = baseNo.split("-");
        if (parts.length === 5) {
          const last = parts[4];
          const next = (parseInt(last, 10) + 1).toString().padStart(2, "0");
          parts[4] = next;
          return parts.join("-");
        }
        if (parts.length === 4) return `${baseNo}-01`;
        return `${baseNo}-01`;
      };

      // Convert special offers array to string for database storage
      const specialOffersString = quotationData.specialOffers
        ? quotationData.specialOffers.filter((offer) => offer.trim()).join("|")
        : "";

      // Try insert with retries on unique constraint (concurrent save)
      let authoritativeQuotationNo = null;
      let lastError = null;

      // Extract prefix from current quotation number to maintain consistency
      const extractPrefix = (quotationNo) => {
        const parts = quotationNo.split("-");
        if (parts.length >= 4) {
          return parts.slice(0, 3).join("-"); // e.g., "CRR-25-26"
        }
        return quotationNo.split("-")[0]; // fallback to first part
      };

      // Initialize candidate number
      let candidateNo = quotationData.quotationNo;
      const currentPrefix = extractPrefix(candidateNo);

      if (isRevising && selectedQuotation) {
        // If already a revision, keep it, else start with -01
        const partsInit = candidateNo.split("-");
        if (partsInit.length === 4) {
          candidateNo = `${candidateNo}-01`;
        }
      }
      // No else block - use existing quotationNo as is

      for (let attempt = 0; attempt < 5; attempt++) {
        // On attempts > 0, adjust candidate number
        if (attempt > 0) {
          if (isRevising && selectedQuotation) {
            // Increment the revision number from the last attempted candidate
            candidateNo = nextRevision(candidateNo);
          } else {
            // For base quotation, increment within same prefix
            const parts = candidateNo.split("-");
            if (parts.length === 4) {
              const lastNumber = parseInt(parts[3], 10);
              const newNumber = lastNumber + 1;
              candidateNo = `${currentPrefix}-${newNumber}`;
            } else {
              // Fallback: fetch latest but keep prefix
              candidateNo = await getNextQuotationNumber(currentPrefix.split("-")[0]);
            }
          }
        }

        // Prepare data for Supabase
        const quotationRecord = {
          Quotation_No: candidateNo,
          Quotation_Date: convertDateToISO(quotationData.date),
          Prepared_By: quotationData.preparedBy,
          Consigner_State: quotationData.consignorState,
          Reference_Name: quotationData.consignorName,
          Address: quotationData.consignorAddress,
          Mobile: quotationData.consignorMobile,
          Phone: quotationData.consignorPhone,
          GSTIN: quotationData.consignorGSTIN,
          State_Code: quotationData.consignorStateCode,
          Company_Name: quotationData.consigneeName,
          Consignee_Address: quotationData.consigneeAddress,
          Ship_To: quotationData.shipTo || quotationData.consigneeAddress,
          State: quotationData.consigneeState,
          Contact_Name: quotationData.consigneeContactName,
          Contact_No: quotationData.consigneeContactNo,
          Consignee_GSTIN: quotationData.consigneeGSTIN,
          Consignee_State_Code: quotationData.consigneeStateCode,
          MSME_No: quotationData.msmeNumber,
          Validity: quotationData.validity,
          Payment_Terms: quotationData.paymentTerms,
          Delivery: quotationData.delivery,
          Freight: quotationData.freight,
          Insurance: quotationData.insurance,
          Taxes: quotationData.taxes,
          Notes: quotationData.notes.filter((note) => note.trim()).join("|"),
          Account_No: quotationData.accountNo,
          Bank_Name: quotationData.bankName,
          Bank_Address: quotationData.bankAddress,
          IFSC_Code: quotationData.ifscCode,
          Email: quotationData.email,
          Website: quotationData.website,
          Pan: quotationData.pan,
          Items: quotationData.items,
          Divine_Empire_10th_Anniversary_Special_Offer: specialOffersString,
          Grand_Total: parseFloat(finalGrandTotal),
        };

        const { data, error } = await supabase
          .from("Make_Quotation")
          .insert([quotationRecord])
          .select();

        if (!error) {
          authoritativeQuotationNo = data && data[0] && data[0].Quotation_No ? data[0].Quotation_No : candidateNo;
          break;
        }

        lastError = error;
        const isUniqueViolation =
          (error.code && error.code === "23505") ||
          (error.message && error.message.toLowerCase().includes("duplicate key value")) ||
          (error.message && error.message.includes("quotation_no_unique"));
        if (!isUniqueViolation) {
          throw new Error("Error saving quotation: " + error.message);
        }

        // Small jittered delay before retry
        await new Promise((res) => setTimeout(res, 100 + Math.random() * 200));
      }

      if (!authoritativeQuotationNo) {
        throw new Error("Error saving quotation: " + (lastError?.message || "unique constraint conflict"));
      }

      // Now generate PDF using the authoritative number
      const pdfDataUri = await generatePDFFromData(
        { ...quotationData, Quotation_No: authoritativeQuotationNo },
        selectedReferences,
        specialDiscount,
        hiddenColumns,
        hiddenFields,
      );

      // Validate that we have a proper data URI
      if (!pdfDataUri || !pdfDataUri.startsWith("data:application/pdf")) {
        throw new Error("Invalid PDF data generated");
      }

      // Extract base64 data correctly from data URI
      const base64Data = pdfDataUri.split(",")[1];
      if (!base64Data) {
        throw new Error("Could not extract PDF data from generated content");
      }

      // Convert base64 to blob
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pdfBlob = new Blob([bytes], { type: "application/pdf" });

      // Upload PDF to Supabase bucket with authoritative number in filename
      const fileName = `Quotation_${authoritativeQuotationNo}.pdf`;
      const uploadedPdfUrl = await uploadPDFToSupabase(pdfBlob, fileName);

      // Update the record with the Pdf_Url
      await supabase
        .from("Make_Quotation")
        .update({ Pdf_Url: uploadedPdfUrl })
        .eq("Quotation_No", authoritativeQuotationNo);

      // Set the PDF URL for reference
      setPdfUrl(uploadedPdfUrl);

      if (isRevising && selectedQuotation) {
        setQuotationData((prev) => ({
          ...prev,
          quotationNo: finalQuotationNo,
        }));
      }

      alert("Quotation saved successfully with PDF uploaded to Supabase!");

      // Reset form for new quotation
      const nextQuotationNumber = await getNextQuotationNumber();
      setQuotationData({
        quotationNo: nextQuotationNumber,
        date: new Date().toLocaleDateString("en-GB"),
        consignorState: "",
        consignorName: "",
        consignorAddress: "",
        consignorMobile: "",
        consignorPhone: "",
        consignorGSTIN: "",
        consignorStateCode: "",
        companyName: "",
        consigneeName: "",
        consigneeAddress: "",
        consigneeState: "",
        consigneeContactName: "",
        consigneeContactNo: "",
        consigneeGSTIN: "",
        consigneeStateCode: "",
        msmeNumber: "",
        items: [
          {
            id: 1,
            code: "",
            name: "",
            gst: 18,
            qty: 1,
            units: "Nos",
            rate: 0,
            discount: 0,
            flatDiscount: 0,
            amount: 0,
          },
        ],
        totalFlatDiscount: 0,
        subtotal: 0,
        cgstRate: 9,
        sgstRate: 9,
        cgstAmount: 0,
        sgstAmount: 0,
        total: 0,
        validity:
          "The above quoted prices are valid up to 10 days from date of offer.",
        paymentTerms:
          "100% advance payment in the mode of NEFT, RTGS & DD.Payment only accepted in company's account - DIVINE EMPIRE INDIA PVT LTD.",
        delivery:
          "Material will be dispatched after receipt of advance payment and upon confirmation of complete purchase order (PO) from the buyer.",
        freight: "Extra as per actual.",
        insurance: "Transit insurance for all shipment is at Buyer's scope.",
        taxes: "Extra mentioned in the quotation.",
        accountNo: "",
        bankName: "",
        bankAddress: "",
        ifscCode: "",
        email: "",
        website: "",
        pan: "",
        notes: [""],
        preparedBy: "",
        specialOffers: [""],
      });
    } catch (error) {
      console.error("Error in handleSaveQuotation:", error);
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <QuotationHeader
        image={image1}
        isRevising={isRevising}
        toggleRevising={toggleRevising}
      />

      <div className="bg-white rounded-lg shadow border">
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium ${activeTab === "edit"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-tl-lg"
                  : "text-gray-600"
                }`}
              onClick={() => setActiveTab("edit")}
              disabled={isViewMode}
            >
              Edit Quotation
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "preview"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                  : "text-gray-600"
                }`}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === "edit" ? (
            <QuotationForm
              quotationData={quotationData}
              handleInputChange={handleInputChange}
              handleItemChange={handleItemChange}
              handleFlatDiscountChange={handleFlatDiscountChange}
              handleAddItem={handleAddItem}
              handleNoteChange={handleNoteChange}
              addNote={addNote}
              removeNote={removeNote}
              hiddenFields={hiddenFields}
              toggleFieldVisibility={toggleFieldVisibility}
              isRevising={isRevising}
              existingQuotations={existingQuotations}
              selectedQuotation={selectedQuotation}
              handleQuotationSelect={handleQuotationSelect}
              isLoadingQuotation={isLoadingQuotation}
              handleSpecialDiscountChange={handleSpecialDiscountChangeWrapper}
              specialDiscount={specialDiscount}
              setSpecialDiscount={setSpecialDiscount}
              selectedReferences={selectedReferences}
              setSelectedReferences={setSelectedReferences}
              imageform={imageform}
              addSpecialOffer={addSpecialOffer}
              removeSpecialOffer={removeSpecialOffer}
              handleSpecialOfferChange={handleSpecialOfferChange}
              setQuotationData={setQuotationData}
              hiddenColumns={hiddenColumns}
              setHiddenColumns={setHiddenColumns}

            />
          ) : (
            <QuotationPreview
              quotationData={quotationData}
              quotationLink={quotationLink}
              pdfUrl={pdfUrl}
              selectedReferences={selectedReferences}
              specialDiscount={specialDiscount}
              imageform={imageform}
              handleGenerateLink={handleGenerateLink}
              handleGeneratePDF={handleGeneratePDF}
              isGenerating={isGenerating}
              isSubmitting={isSubmitting}
              hiddenColumns={hiddenColumns}
              hiddenFields={hiddenFields} // ← यह add करें

            />
          )}
        </div>
      </div>

      {activeTab === "edit" && (
        <div className="flex justify-between mt-4">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={handleSaveQuotation}
            disabled={isSubmitting || isGenerating}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Quotation
              </>
            )}
          </button>
          <div className="space-x-2">
            <button
              className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center inline-flex"
              onClick={handleGenerateLink}
              disabled={isGenerating || isSubmitting}
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Generate Link
            </button>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center inline-flex"
              onClick={handleGeneratePDF}
              disabled={isGenerating || isSubmitting}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quotation;
