"use client";

import { useState } from "react";

export const useQuotationData = (initialSpecialDiscount = 0) => {
  const [specialDiscount, setSpecialDiscount] = useState(
    initialSpecialDiscount
  );
  const [hiddenFields, setHiddenFields] = useState({
    validity: false,
    paymentTerms: false,
    delivery: false,
    freight: false,
    insurance: false,
    taxes: false,
    warranty: false,
    afterReceiptOfMaterial: false,
    technicalSupport: false,
  });

  const [quotationData, setQuotationData] = useState({
    quotationNo: "NBD-...",
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
        description: "",
        gst: 18,
        qty: 1,
        units: "Nos",
        rate: 0,
        discount: 0,
        flatDiscount: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    totalFlatDiscount: 0,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    isIGST: false,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    total: 0,
    validity:
      "The above quoted prices are valid up to 10 days from date of offer.",
    paymentTerms:
      "100% advance payment in the mode of NEFT, RTGS & DD.Payment only accepted in company's account - DIVINE EMPIRE INDIA PVT LTD.",
    delivery:
      "Material will be dispatched after receipt of advance payment and upon confirmation of complete purchase order (PO) from the buyer.",
    freight: "Extra as per actual.",
    insurance: "Transit insurance for all shipment is at Buyer's scope.",
    warranty: "6 months warranty applicable against Manufacturing defects.",
    taxes: "Extra as per actual.",
    afterReceiptOfMaterial: "In case of any discrepancy in the material, please inform us within 24 hours with supporting images attached. After this period, the company will not be responsible for any discrepancies.",
    technicalSupport: "Video call assistance for installation and troubleshooting of the machine is FOC. For physical assistance: Service charges are free during the warranty period; however, TA & DA will be charged extra as per actuals.",
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

  const roundToTwo = (value) => Number(Number(value || 0).toFixed(2));

  const extractGSTParts = (gstValue) => {
    if (!gstValue) return [];

    const text = String(gstValue).trim();
    const matches = [...text.matchAll(/(\d+(?:\.\d+)?)/g)];
    return matches
      .map((match) => Number.parseFloat(match[1]))
      .filter((num) => Number.isFinite(num));
  };

  const getRatesForCalculation = (gstValue) => {
    const parts = extractGSTParts(gstValue);
    if (parts.length === 0) return [];

    if (parts.every((value) => value === parts[0])) {
      return [parts.reduce((sum, value) => sum + value, 0)];
    }

    return parts;
  };

  const recalculateTotals = (
    items,
    shouldUseIGST,
    discountValue = specialDiscount
  ) => {
    const subtotal = roundToTwo(
      items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    );

    const cgstBreakdown = {};
    const sgstBreakdown = {};
    const igstBreakdown = {};

    items.forEach((item) => {
      const amount = Number(item.amount || 0);
      if (amount <= 0) return;

      const ratesToApply = getRatesForCalculation(item.gst);
      if (ratesToApply.length === 0) return;

      ratesToApply.forEach((rate) => {
        if (rate <= 0) return;

        if (shouldUseIGST) {
          igstBreakdown[rate] =
            (igstBreakdown[rate] || 0) + roundToTwo((amount * rate) / 100);
        } else {
          const halfRate = rate / 2;
          const halfValue = roundToTwo((amount * halfRate) / 100);
          cgstBreakdown[halfRate] = (cgstBreakdown[halfRate] || 0) + halfValue;
          sgstBreakdown[halfRate] = (sgstBreakdown[halfRate] || 0) + halfValue;
        }
      });
    });

    const sumValues = (obj) =>
      Object.values(obj).reduce((acc, value) => acc + Number(value || 0), 0);
    const sumKeys = (obj) =>
      Object.keys(obj).reduce((acc, key) => acc + Number.parseFloat(key || 0), 0);

    const cgstAmount = roundToTwo(sumValues(cgstBreakdown));
    const sgstAmount = roundToTwo(sumValues(sgstBreakdown));
    const igstAmount = roundToTwo(sumValues(igstBreakdown));

    const cgstRate = !shouldUseIGST ? roundToTwo(sumKeys(cgstBreakdown)) : 0;
    const sgstRate = !shouldUseIGST ? roundToTwo(sumKeys(sgstBreakdown)) : 0;
    const igstRate = shouldUseIGST ? roundToTwo(sumKeys(igstBreakdown)) : 0;

    const totalBeforeSpecialDiscount =
      subtotal + cgstAmount + sgstAmount + igstAmount;

    const total = Math.max(
      0,
      roundToTwo(totalBeforeSpecialDiscount - Number(discountValue || 0))
    );

    return {
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      cgstRate,
      sgstRate,
      igstRate,
      cgstBreakdown,
      sgstBreakdown,
      igstBreakdown,
      total,
    };
  };

  const checkStateAndCalculateGST = (consignorState, consigneeState) => {
    const statesMatch =
      consignorState &&
      consigneeState &&
      consignorState.toLowerCase().trim() ===
        consigneeState.toLowerCase().trim();
    return !statesMatch;
  };

  // FIXED: Improved handleInputChange to prevent data loss
  const handleInputChange = (field, value) => {
    setQuotationData((prev) => {
      // Create a deep copy of previous state to avoid mutations
      const newData = JSON.parse(JSON.stringify(prev));
      
      // Update the specific field
      newData[field] = value;

      // Handle items array update
      if (field === "items") {
        const totalFlatDiscount = value.reduce(
          (sum, item) => sum + Number(item.flatDiscount || 0),
          0
        );

        const shouldUseIGST = checkStateAndCalculateGST(
          newData.consignorState,
          newData.consigneeState
        );

        const totals = recalculateTotals(value, shouldUseIGST);

        return {
          ...newData,
          totalFlatDiscount,
          isIGST: shouldUseIGST,
          ...totals,
        };
      }

      if (field === "consignorState" || field === "consigneeState") {
        const shouldUseIGST = checkStateAndCalculateGST(
          field === "consignorState" ? value : newData.consignorState,
          field === "consigneeState" ? value : newData.consigneeState
        );

        const totalFlatDiscount = newData.items.reduce(
          (sum, item) => sum + Number(item.flatDiscount || 0),
          0
        );
        
        const totals = recalculateTotals(newData.items, shouldUseIGST);

        return {
          ...newData,
          isIGST: shouldUseIGST,
          totalFlatDiscount,
          ...totals,
        };
      }

      return newData;
    });
  };

  // FIXED: Improved handleItemChange to prevent data loss
  const handleItemChange = (id, field, value) => {
    setQuotationData((prev) => {
      // Create a deep copy of previous state
      const prevCopy = JSON.parse(JSON.stringify(prev));
      
      const newItems = prevCopy.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (
            field === "qty" ||
            field === "rate" ||
            field === "discount" ||
            field === "flatDiscount"
          ) {
            const baseAmount =
              Number(updatedItem.qty || 0) * Number(updatedItem.rate || 0);
            const discountedAmount =
              baseAmount * (1 - Number(updatedItem.discount || 0) / 100);
            updatedItem.amount = Math.max(
              0,
              discountedAmount - Number(updatedItem.flatDiscount || 0)
            );
          }

          return updatedItem;
        }
        return item;
      });

      const totalFlatDiscount = newItems.reduce(
        (sum, item) => sum + Number(item.flatDiscount || 0),
        0
      );

      const shouldUseIGST = checkStateAndCalculateGST(
        prevCopy.consignorState,
        prevCopy.consigneeState
      );

      const totals = recalculateTotals(newItems, shouldUseIGST);

      return {
        ...prevCopy,
        items: newItems,
        totalFlatDiscount,
        isIGST: shouldUseIGST,
        ...totals,
      };
    });
  };

  const handleFlatDiscountChange = (value) => {
    setQuotationData((prev) => {
      const numValue = Number(value);
      const totals = recalculateTotals(prev.items, prev.isIGST);

      return {
        ...prev,
        totalFlatDiscount: numValue,
        ...totals,
      };
    });
  };

  const handleSpecialDiscountChange = (value) => {
    const discount = Number(value) || 0;
    setSpecialDiscount(discount);

    setQuotationData((prev) => {
      const totals = recalculateTotals(prev.items, prev.isIGST, discount);

      return {
        ...prev,
        ...totals,
      };
    });
  };

  const toggleFieldVisibility = (field) => {
    setHiddenFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleNoteChange = (index, value) => {
    setQuotationData((prev) => {
      const newNotes = [...prev.notes];
      newNotes[index] = value;
      return {
        ...prev,
        notes: newNotes,
      };
    });
  };

  const addNote = () => {
    setQuotationData((prev) => ({
      ...prev,
      notes: [...prev.notes, ""],
    }));
  };

  const removeNote = (index) => {
    setQuotationData((prev) => {
      const newNotes = [...prev.notes];
      newNotes.splice(index, 1);
      return {
        ...prev,
        notes: newNotes,
      };
    });
  };

  const handleAddItem = () => {
    const newId =
      Math.max(0, ...quotationData.items.map((item) => item.id)) + 1;
    setQuotationData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: newId,
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
    }));
  };

  const addSpecialOffer = () => {
    setQuotationData((prev) => ({
      ...prev,
      specialOffers: [...(prev.specialOffers || [""]), ""],
    }));
  };

  const removeSpecialOffer = (index) => {
    setQuotationData((prev) => {
      const newSpecialOffers = [...(prev.specialOffers || [])];
      newSpecialOffers.splice(index, 1);
      return {
        ...prev,
        specialOffers: newSpecialOffers.length > 0 ? newSpecialOffers : [""],
      };
    });
  };

  const handleSpecialOfferChange = (index, value) => {
    setQuotationData((prev) => {
      const newSpecialOffers = [...(prev.specialOffers || [])];

      while (newSpecialOffers.length <= index) {
        newSpecialOffers.push("");
      }

      newSpecialOffers[index] = value;
      return {
        ...prev,
        specialOffers: newSpecialOffers,
      };
    });
  };

  const getGSTDisplayText = (gstValue) => {
    const parts = extractGSTParts(gstValue);
    if (parts.length === 0) return "0%";

    if (parts.every((value) => value === parts[0])) {
      return `${parts.reduce((sum, value) => sum + value, 0)}%`;
    }

    return parts.map((value) => `${value}%`).join(" + ");
  };

  return {
    quotationData,
    setQuotationData,
    handleInputChange,
    handleItemChange,
    handleFlatDiscountChange,
    handleSpecialDiscountChange,
    specialDiscount,
    setSpecialDiscount,
    handleAddItem,
    handleNoteChange,
    addNote,
    removeNote,
    hiddenFields,
    toggleFieldVisibility,
    addSpecialOffer,
    removeSpecialOffer,
    handleSpecialOfferChange,
    getGSTDisplayText,
  };
};