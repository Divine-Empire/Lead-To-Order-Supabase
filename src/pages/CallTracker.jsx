"use client";

import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  SearchIcon,
  ArrowRightIcon,
  BuildingIcon,
} from "../components/Icons";
import { AuthContext } from "../App";
import CallTrackerForm from "./Call-Tracker-Form";
import supabase from "../utils/supabase";

// Animation classes
const slideIn = "animate-in slide-in-from-right duration-300";
const slideOut = "animate-out slide-out-to-right duration-300";
const fadeIn = "animate-in fade-in duration-300";
const fadeOut = "animate-out fade-out duration-300";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener
    window.addEventListener("resize", checkIsMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

function CallTracker() {
  const isMobile = useIsMobile();
  const { currentUser, userType, isAdmin } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [tenDaysSearchTerm, setTenDaysSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingCallTrackers, setPendingCallTrackers] = useState([]);
  const [historyCallTrackers, setHistoryCallTrackers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [directEnquiryData, setDirectEnquiryData] = useState([]);
  const [showNewCallTrackerForm, setShowNewCallTrackerForm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [callingDaysFilter, setCallingDaysFilter] = useState([]);
  const [enquiryNoFilter, setEnquiryNoFilter] = useState([]);
  const [currentStageFilter, setCurrentStageFilter] = useState([]);
  const [availableEnquiryNos, setAvailableEnquiryNos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [directEnquiryPage, setDirectEnquiryPage] = useState(1);
  const [hasMorePending, setHasMorePending] = useState(true);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [hasMoreDirectEnquiry, setHasMoreDirectEnquiry] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const [orderStatuses, setOrderStatuses] = useState({});
  const [orderRemarks, setOrderRemarks] = useState({});

  const [orderDates, setOrderDates] = useState({});
  // NEW: Add serial number filter state
  const [serialFilter, setSerialFilter] = useState([]);
  const [showSerialDropdown, setShowSerialDropdown] = useState(false);
  const [tenDaysData, setTenDaysData] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown visibility states
  const [showCallingDaysDropdown, setShowCallingDaysDropdown] = useState(false);
  const [showEnquiryNoDropdown, setShowEnquiryNoDropdown] = useState(false);
  const [showCurrentStageDropdown, setShowCurrentStageDropdown] =
    useState(false);

  const [callingDaysCounts, setCallingDaysCounts] = useState({
    pendingToday: 0,
    pendingOverdue: 0,
    pendingUpcoming: 0,
    directToday: 0,
    directOverdue: 0,
    directUpcoming: 0,
    historyToday: 0,
    historyOlder: 0,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    timestamp: true,
    enquiryNo: true,
    enquiryStatus: true,
    customerFeedback: true,
    currentStage: true,
    sendQuotationNo: true,
    quotationSharedBy: true,
    quotationNumber: true,
    valueWithoutTax: true,
    valueWithTax: true,
    quotationUpload: true,
    quotationRemarks: true,
    validatorName: true,
    sendStatus: true,
    validationRemark: true,
    faqVideo: true,
    productVideo: true,
    offerVideo: true,
    productCatalog: true,
    productImage: true,
    nextCallDate: true,
    nextCallTime: true,
    orderStatus: true,
    acceptanceVia: true,
    paymentMode: true,
    paymentTerms: true,
    transportMode: true,
    registrationFrom: true,
    orderVideo: true,
    acceptanceFile: true,
    orderRemark: true,
    apologyVideo: true,
    reasonStatus: true,
    reasonRemark: true,
    holdReason: true,
    holdingDate: true,
    holdRemark: true,
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Refs for observer
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log("Intersection triggered for tab:", activeTab);
          loadMoreData();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, activeTab]
  );

  // 3. Fix the loadMoreData function to properly check conditions
  const loadMoreData = useCallback(() => {
    if (isLoading || isSearching) {
      console.log(
        "Skipping load more - isLoading:",
        isLoading,
        "isSearching:",
        isSearching
      );
      return;
    }

    switch (activeTab) {
      case "pending":
        if (hasMorePending) {
          console.log("Loading more pending data, current page:", pendingPage);
          setPendingPage((prev) => prev + 1);
        } else {
          console.log("No more pending data to load");
        }
        break;
      case "history":
        if (hasMoreHistory) {
          console.log("Loading more history data, current page:", historyPage);
          setHistoryPage((prev) => prev + 1);
        } else {
          console.log("No more history data to load");
        }
        break;
      case "directEnquiry":
        if (hasMoreDirectEnquiry) {
          console.log(
            "Loading more direct enquiry data, current page:",
            directEnquiryPage
          );
          setDirectEnquiryPage((prev) => prev + 1);
        } else {
          console.log("No more direct enquiry data to load");
        }
        break;
    }
  }, [
    isLoading,
    isSearching,
    activeTab,
    hasMorePending,
    hasMoreHistory,
    hasMoreDirectEnquiry,
    pendingPage,
    historyPage,
    directEnquiryPage,
  ]);

  // Helper function to determine priority based on status
  const determinePriority = (status) => {
    if (!status) return "Low";

    const statusLower = status.toLowerCase();
    if (statusLower === "hot") return "High";
    if (statusLower === "warm") return "Medium";
    return "Low";
  };

  // Helper function to format date to DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateValue) => {
    if (!dateValue) return "";

    try {
      if (typeof dateValue === "string" && dateValue.startsWith("Date(")) {
        const dateString = dateValue.substring(5, dateValue.length - 1);
        const [year, month, day] = dateString
          .split(",")
          .map((part) => Number.parseInt(part.trim()));
        return `${day.toString().padStart(2, "0")}/${(month + 1)
          .toString()
          .padStart(2, "0")}/${year}`;
      }

      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
      }

      return dateValue;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateValue;
    }
  };

  // Helper function to format time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (timeValue) => {
    if (!timeValue) return "";

    try {
      if (typeof timeValue === "string" && timeValue.startsWith("Date(")) {
        const dateString = timeValue.substring(5, timeValue.length - 1);
        const parts = dateString.split(",");

        if (parts.length >= 5) {
          const hour = Number.parseInt(parts[3].trim());
          const minute = Number.parseInt(parts[4].trim());
          const period = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minute
            .toString()
            .padStart(2, "0")} ${period}`;
        }
      }

      if (typeof timeValue === "string" && timeValue.includes(":")) {
        const [hour, minute] = timeValue
          .split(":")
          .map((part) => Number.parseInt(part));
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
      }

      return timeValue;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeValue;
    }
  };

  // Helper function to check if a date is today
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    try {
      const date = new Date(dateStr.split("/").reverse().join("-"));
      const today = new Date();
      return date.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  };

  // Helper function to check if a date is overdue
  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    try {
      const date = new Date(dateStr.split("/").reverse().join("-"));
      const today = new Date();
      return date < today;
    } catch {
      return false;
    }
  };

  // Helper function to check if a date is upcoming
  const isUpcoming = (dateStr) => {
    if (!dateStr) return false;
    try {
      const date = new Date(dateStr.split("/").reverse().join("-"));
      const today = new Date();
      return date > today;
    } catch {
      return false;
    }
  };

  const formatItemQty = (itemQtyString) => {
    if (!itemQtyString) return "";

    // If it's already a nicely formatted string, just return it
    if (typeof itemQtyString === "string" && itemQtyString.includes(":")) {
      return itemQtyString;
    }

    try {
      // Try to parse as JSON
      const items = JSON.parse(itemQtyString);

      // Check if it's an array of objects with name/quantity properties
      if (
        Array.isArray(items) &&
        items.length > 0 &&
        typeof items[0] === "object"
      ) {
        return items
          .filter((item) => item.name && item.quantity && item.quantity !== "0")
          .map((item) => `${item.name} : ${item.quantity}`)
          .join(", ");
      }

      // If it's a different JSON format, return the string representation
      return JSON.stringify(items);
    } catch (error) {
      // If parsing fails, return the original string
      console.log(
        "Item quantity is not JSON, returning as plain text:",
        itemQtyString
      );
      return itemQtyString;
    }
  };

  // Replace your matchesCallingDaysFilter function with this:
  // const matchesCallingDaysFilter = (dateValue, activeTab) => {
  //   if (callingDaysFilter.length === 0) return true;

  //   // For pending and directEnquiry tabs, we need to check the actual date values
  //   if (activeTab === "pending" || activeTab === "directEnquiry") {
  //     return callingDaysFilter.some((filter) => {
  //       switch (filter) {
  //         case "today":
  //           return isToday(dateValue);
  //         case "overdue":
  //           return isOverdue(dateValue);
  //         case "upcoming":
  //           return isUpcoming(dateValue);
  //         default:
  //           return false;
  //       }
  //     });
  //   } else {
  //     // For history tab, check if it matches actual dates
  //     return callingDaysFilter.some((filter) => {
  //       switch (filter) {
  //         case "today":
  //           return isToday(dateValue);
  //         case "older":
  //           return !isToday(dateValue) && dateValue !== "";
  //         default:
  //           return false;
  //       }
  //     });
  //   }
  // };

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(visibleColumns).every(Boolean);
    const newState = Object.fromEntries(
      Object.keys(visibleColumns).map((key) => [key, !allSelected])
    );
    setVisibleColumns(newState);
  };

  const columnOptions = [
    { key: "timestamp", label: "Timestamp" },
    { key: "enquiryNo", label: "Enquiry No." },
    { key: "enquiryStatus", label: "Enquiry Status" },
    { key: "customerFeedback", label: "What Did Customer Say" },
    { key: "currentStage", label: "Current Stage" },
    { key: "sendQuotationNo", label: "Send Quotation No." },
    { key: "quotationSharedBy", label: "Quotation Shared By" },
    { key: "quotationNumber", label: "Quotation Number" },
    { key: "valueWithoutTax", label: "Value Without Tax" },
    { key: "valueWithTax", label: "Value With Tax" },
    { key: "quotationUpload", label: "Quotation Upload" },
    { key: "quotationRemarks", label: "Quotation Remarks" },
    { key: "validatorName", label: "Validator Name" },
    { key: "sendStatus", label: "Send Status" },
    { key: "validationRemark", label: "Validation Remark" },
    { key: "faqVideo", label: "FAQ Video" },
    { key: "productVideo", label: "Product Video" },
    { key: "offerVideo", label: "Offer Video" },
    { key: "productCatalog", label: "Product Catalog" },
    { key: "productImage", label: "Product Image" },
    { key: "nextCallDate", label: "Next Call Date" },
    { key: "nextCallTime", label: "Next Call Time" },
    { key: "orderStatus", label: "Order Status" },
    { key: "acceptanceVia", label: "Acceptance Via" },
    { key: "paymentMode", label: "Payment Mode" },
    { key: "paymentTerms", label: "Payment Terms" },
    { key: "transportMode", label: "Transport Mode" },
    { key: "registrationFrom", label: "Registration From" },
    { key: "orderVideo", label: "Order Video" },
    { key: "acceptanceFile", label: "Acceptance File" },
    { key: "orderRemark", label: "Remark" },
    { key: "apologyVideo", label: "Apology Video" },
    { key: "reasonStatus", label: "Reason Status" },
    { key: "reasonRemark", label: "Reason Remark" },
    { key: "holdReason", label: "Hold Reason" },
    { key: "holdingDate", label: "Holding Date" },
    { key: "holdRemark", label: "Hold Remark" },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowCallingDaysDropdown(false);
        setShowEnquiryNoDropdown(false);
        setShowCurrentStageDropdown(false);
        setShowColumnDropdown(false);
        setShowSerialDropdown(false); // NEW: Close serial dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add this function near your other fetch functions
  // Replace your fetchTenDaysData function with this fixed version
  // Replace your fetchTenDaysData function with this updated version
  const fetchTenDaysData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec?sheet=ORDER-DISPATCH&action=fetch"
      );

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("Response is not JSON:", text);
        setTenDaysData([]);
        setIsLoading(false);
        return;
      }

      if (result.success && result.data) {
        const headers = result.data[0];
        const rows = result.data.slice(4);

        // Find column indices
        const awIndex = headers.findIndex(
          (h) =>
            h &&
            typeof h === "string" &&
            h.toLowerCase().includes("delivery status")
        );
        const cfIndex = headers.findIndex(
          (h) =>
            h &&
            typeof h === "string" &&
            h.toLowerCase().includes("revised order date")
        );
        const cgIndex = headers.findIndex(
          (h) =>
            h &&
            typeof h === "string" &&
            h.toLowerCase().includes("revised order status")
        );
        const chIndex = headers.findIndex(
          (h) =>
            h &&
            typeof h === "string" &&
            h.toLowerCase().includes("revised order date2")
        ); // New column for Date
        const ciIndex = headers.findIndex(
          (h) =>
            h &&
            typeof h === "string" &&
            h.toLowerCase().includes("sales coordinator")
        );
        const cjIndex = headers.findIndex(
          (h) =>
            h &&
            typeof h === "string" &&
            h.toLowerCase().includes("revised order remark")
        ); // New column for Remarks

        // Use fallback indices if specific column names not found
        const awCol = awIndex >= 0 ? awIndex : 48;
        const cfCol = cfIndex >= 0 ? cfIndex : 83;
        const cgCol = cgIndex >= 0 ? cgIndex : 84;
        const chCol = chIndex >= 0 ? chIndex : 85; // Date column - adjust this number if needed
        const ciCol = ciIndex >= 0 ? ciIndex : 86;
        const cjCol = cjIndex >= 0 ? cjIndex : 87; // Remarks column - adjust this number if needed

        console.log("Using column positions:", {
          awCol,
          cfCol,
          cgCol,
          chCol,
          ciCol,
          cjCol,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tenDaysOrders = [];

        rows.forEach((row, index) => {
          try {
            const awValue = row[awCol];
            const cfValue = row[cfCol];
            const cgValue = row[cgCol]; // Status
            const chValue = row[chCol]; // Remarks (CH column)
            const ciValue = row[ciCol]; // Sales Coordinator
            const cjValue = row[cjCol]; // Date (CJ column)
            // Debug logging
            console.log("Processing row:", {
              cfValue,
              cgValue,
              cgValueType: typeof cgValue,
              ciValue,
              currentUser: currentUser?.username,
              isAdmin: isAdmin(),
            });

            const statusStr = String(cgValue || "")
              .toLowerCase()
              .trim();

            const isUserRow =
              isAdmin() ||
              (currentUser?.username &&
                ciValue &&
                ciValue.toString().trim() === currentUser.username.trim());
            // Debug for DO-6 specifically - check if it exists at all
            if (
              row[1] &&
              (row[1].toString().includes("DO-6") ||
                row[1].toString().includes("DO-03"))
            ) {
              console.log(`${row[1]} Found in raw data:`, {
                orderNo: row[1],
                cgValue,
                statusStr,
                ciValue,
                currentUser: currentUser?.username,
                isUserRow,
                isAdmin: isAdmin(),
                awValue: row[awCol],
                awValueLower: awValue
                  ? awValue.toString().toLowerCase()
                  : "undefined",
              });
            }

            // Check if order is not dispatched/completed
            const awValueLower = awValue
              ? awValue.toString().toLowerCase().trim()
              : "";
            const isNotDispatched =
              !awValueLower ||
              (!awValueLower.includes("dispatched") &&
                !awValueLower.includes("delivered") &&
                !awValueLower.includes("completed") &&
                !awValueLower.includes("done"));

            // Only include orders that are not done

            const includeByStatus =
              !statusStr ||
              statusStr === "" ||
              statusStr === "null" ||
              statusStr === "undefined" ||
              statusStr !== "done";
            if (isUserRow && isNotDispatched && includeByStatus && cfValue) {
              let cfDate = null;
              if (cfValue) {
                if (cfValue instanceof Date) {
                  cfDate = new Date(cfValue);
                } else if (typeof cfValue === "string") {
                  let parsed = new Date(cfValue);
                  if (isNaN(parsed.getTime())) {
                    const m = cfValue.match(
                      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/
                    );
                    if (m) {
                      const day = parseInt(m[1], 10);
                      const month = parseInt(m[2], 10) - 1;
                      const year =
                        parseInt(m[3], 10) + (m[3].length === 2 ? 2000 : 0);
                      parsed = new Date(year, month, day);
                    }
                  }
                  if (isNaN(parsed.getTime())) {
                    const serialDate = parseFloat(cfValue);
                    if (!isNaN(serialDate)) {
                      parsed = new Date((serialDate - 25569) * 86400 * 1000);
                    }
                  }
                  if (!isNaN(parsed.getTime())) {
                    cfDate = parsed;
                  }
                } else if (typeof cfValue === "number") {
                  const parsed = new Date((cfValue - 25569) * 86400 * 1000);
                  if (!isNaN(parsed.getTime())) {
                    cfDate = parsed;
                  }
                }
              }

              const order = {
                id: index + 2,
                timestamp: row[0] || "",
                orderNo: row[1] || "",
                quotationNo: row[2] || "",
                companyName: row[3] || "",
                contactPersonName: row[4] || "",
                contactNumber: row[5] || "",
                billingAddress: row[6] || "",
                shippingAddress: row[7] || "",
                paymentMode: row[8] || "",
                paymentTerms: row[9] || "",
                referenceName: row[10] || "",
                email: row[11] || "",
                transportMode: row[32] || "",
                destination: row[33] || "",
                itemQty: row[34] || "",
                poNumber: row[35] || "",
                totalOrderQty: row[40] || "",
                amountTotal: row[41] || "",
                dispatchStatus: row[48] || "",
                salesCoordinator: ciValue || "",
                existingStatus:
                  statusStr &&
                  statusStr !== "null" &&
                  statusStr !== "undefined" &&
                  statusStr !== ""
                    ? statusStr
                    : "pending",
                existingDate: (() => {
                  if (!cjValue) return "";
                  try {
                    let date;

                    // Handle different date formats
                    if (cjValue instanceof Date) {
                      date = new Date(cjValue);
                    } else if (typeof cjValue === "string") {
                      // Try parsing as string
                      date = new Date(cjValue);

                      // If invalid, try DD/MM/YYYY format
                      if (isNaN(date.getTime())) {
                        const match = cjValue.match(
                          /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/
                        );
                        if (match) {
                          const day = parseInt(match[1], 10);
                          const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
                          const year =
                            parseInt(match[3], 10) +
                            (match[3].length === 2 ? 2000 : 0);
                          date = new Date(year, month, day);
                        }
                      }
                    } else if (typeof cjValue === "number") {
                      // Handle Excel serial date
                      date = new Date((cjValue - 25569) * 86400 * 1000);
                    }

                    if (date && !isNaN(date.getTime())) {
                      // Format as YYYY-MM-DD in local timezone to avoid timezone issues
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      return `${year}-${month}-${day}`;
                    }

                    return "";
                  } catch (e) {
                    console.error("Error parsing date:", cjValue, e);
                    return "";
                  }
                })(),
                existingRemarks: chValue || "",
              };

              if (cfDate && !isNaN(cfDate.getTime())) {
                const normalizedCfDate = new Date(cfDate);
                normalizedCfDate.setHours(0, 0, 0, 0);
                const normalizedToday = new Date(today);
                normalizedToday.setHours(0, 0, 0, 0);
                const diffTime =
                  normalizedToday.getTime() - normalizedCfDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0) {
                  order.cfDate = cfDate.toLocaleDateString();
                  order.daysAgo = diffDays;
                  order.status = diffDays <= 10 ? "within 10 days" : "overdue";
                } else {
                  order.cfDate = cfDate.toLocaleDateString();
                  order.daysAgo = diffDays;
                  order.status = "pending"; // Future date
                }
              } else {
                order.cfDate = "";
                order.daysAgo = "";
                order.status = "pending";
              }

              tenDaysOrders.push(order);
            }
          } catch (error) {
            console.error("Error processing row:", error, row);
          }
        });

        console.log("Filtered 10 days orders:", tenDaysOrders);
        setTenDaysData(tenDaysOrders);

        // Initialize state with existing values
        const initialStatuses = {};
        const initialDates = {};
        const initialRemarks = {};

        tenDaysOrders.forEach((order) => {
          initialStatuses[order.orderNo] = order.existingStatus;
          initialDates[order.orderNo] = order.existingDate;
          initialRemarks[order.orderNo] = order.existingRemarks;
        });

        setOrderStatuses(initialStatuses);
        setOrderDates(initialDates);
        setOrderRemarks(initialRemarks);
      } else {
        console.error("Error fetching 10 days data:", result.error);
        setTenDaysData([]);
      }
    } catch (error) {
      console.error("Error fetching 10 days data:", error);
      setTenDaysData([]);
    }
    setIsLoading(false);
  };

  // Also update your useEffect to properly handle the 10 days tab
  useEffect(() => {
    if (isSearching) {
      console.log("Skipping fetch due to search in progress");
      return;
    }

    const fetchData = async () => {
      console.log("Fetching data for tab:", activeTab, "pages:", {
        pendingPage,
        historyPage,
        directEnquiryPage,
      });

      // Get date filters from callingDaysFilter
      const dateFilters = getDateFiltersFromCallingDays();

      switch (activeTab) {
        case "pending":
          await fetchPendingData(
            pendingPage,
            searchTerm,
            pendingPage > 1,
            dateFilters
          );
          break;
        case "history":
          await fetchHistoryData(
            historyPage,
            searchTerm,
            historyPage > 1,
            dateFilters
          );
          break;
        case "directEnquiry":
          await fetchDirectEnquiryData(
            directEnquiryPage,
            searchTerm,
            directEnquiryPage > 1,
            dateFilters
          );
          break;
        case "tenDays":
          await fetchTenDaysData(); // This was missing!
          break;
      }
    };

    fetchData();
  }, [
    activeTab,
    pendingPage,
    historyPage,
    directEnquiryPage,
    callingDaysFilter,
  ]);

  // 1. Update the fetchPendingData function to accept date filters
  const fetchPendingData = async (
    page = 1,
    searchTerm = "",
    isLoadMore = false,
    dateFilters = {}
  ) => {
    if (isLoadMore && !hasMorePending) return;

    setIsLoading(true);
    const itemsPerPage = 50;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from("leads_to_order")
      .select("*", { count: "exact" })
      .not("Planned1", "is", null)
      .is("Actual1", null)
      .order("LD-Lead-No", { ascending: true })
      .range(from, to);

    // Add date filtering for pending data
    if (dateFilters.today) {
      const today = new Date().toISOString().split("T")[0];
      query = query
        .gte("Next Call Date_1", today)
        .lt(
          "Next Call Date_1",
          new Date(Date.now() + 86400000).toISOString().split("T")[0]
        );
    } else if (dateFilters.overdue) {
      const today = new Date().toISOString().split("T")[0];
      query = query.lt("Next Call Date_1", today);
    } else if (dateFilters.upcoming) {
      const today = new Date().toISOString().split("T")[0];
      query = query.gt("Next Call Date_1", today);
    }

    if (searchTerm) {
      query = query.or(
        `LD-Lead-No.ilike.%${searchTerm}%,Lead_Receiver_Name.ilike.%${searchTerm}%,Company_Name.ilike.%${searchTerm}%,Phone_Number.ilike.%${searchTerm}%`
      );
    }

    if (!isAdmin() && currentUser && currentUser.username) {
      query = query.eq("SC_Name", currentUser.username);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching leads:", error.message);
      setIsLoading(false);
      return [];
    } else {
      const transformedData = data.map((item, index) => ({
        id: from + index + 1,
        serialNo: from + index + 1,
        Timestamp: formatDateToDDMMYYYY(item.Timestamp) || "",
        lead_no: item["LD-Lead-No"] || "",
        Lead_Receiver_Name: item["Lead_Receiver_Name"] || "",
        Lead_Source: item["Lead_Source"] || "",
        Phone_Number: item["Phone_Number"] || "",
        salesperson_Name: item["Salesperson_Name"] || "",
        Company_Name: item["Company_Name"] || "",
        Current_Stage: item["Current_Stage"] || "",
        Calling_Days: item["Calling_Days"] || "",
        priority: determinePriority(item["Lead_Source"] || ""),
        itemQty: formatItemQty(item["Item/qty"]) || "",
        sc_name: item["SC_Name"] || "",
        nextCallDate: item["Next_Call_Date"] || "",
        nextCallDate1: item["Next Call Date_1"] || "",
      }));

      console.log(
        `Received ${transformedData.length} items, total count: ${count}`
      );

      if (isLoadMore) {
        setPendingData((prev) => {
          console.log(
            "Appending to existing data, current length:",
            prev.length
          );
          return [...prev, ...transformedData];
        });
      } else {
        console.log("Setting new data");
        setPendingData(transformedData);
      }

      // Check if there's more data - fixed logic
      const hasMore =
        transformedData.length === itemsPerPage &&
        from + transformedData.length < (count || 0);
      console.log(
        `Has more data: ${hasMore}, items received: ${transformedData.length}, total available: ${count}`
      );
      setHasMorePending(hasMore);

      setIsLoading(false);
      return transformedData;
    }
  };

  // Replace your existing fetchHistoryData function with this:
  // 1. Fix the column name issue in fetchHistoryData
  const fetchHistoryData = async (
    page = 1,
    searchTerm = "",
    isLoadMore = false,
    dateFilters = {}
  ) => {
    if (isLoadMore && !hasMoreHistory) return;

    setIsLoading(true);
    const itemsPerPage = 50;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from("enquiry_tracker")
      .select("*", { count: "exact" })
      .order('"Enquiry No."', { ascending: true })
      .range(from, to);

    // Add date filtering for history data
    if (dateFilters.today) {
      const today = new Date().toISOString().split("T")[0];
      query = query
        .gte('"Next Call Date"', today)
        .lt(
          '"Next Call Date"',
          new Date(Date.now() + 86400000).toISOString().split("T")[0]
        );
    } else if (dateFilters.older) {
      const today = new Date().toISOString().split("T")[0];
      query = query.lt('"Next Call Date"', today);
    }

    // Replace the search functionality in your fetchHistoryData function
    if (searchTerm) {
      query = query.or(
        `"Enquiry No.".ilike.%${searchTerm}%,"What Did Customer Say".ilike.%${searchTerm}%,"Current Stage".ilike.%${searchTerm}%,"Quotation Number".ilike.%${searchTerm}%,"Quotation Shared By".ilike.%${searchTerm}%,"Quotation Remarks".ilike.%${searchTerm}%,"Quotation Validator Name".ilike.%${searchTerm}%,"Quotation Send Status".ilike.%${searchTerm}%,"Quotation Validation Remark".ilike.%${searchTerm}%,"Is Order Received? Status".ilike.%${searchTerm}%,"Acceptance Via".ilike.%${searchTerm}%,"Payment Mode".ilike.%${searchTerm}%,"Payment Terms (In Days)".ilike.%${searchTerm}%,"Transport Mode".ilike.%${searchTerm}%,"CONVEYED FOR REGISTRATION FORM".ilike.%${searchTerm}%,"Remark".ilike.%${searchTerm}%,"If No Then Get Relevant Reason Status".ilike.%${searchTerm}%,"If No Then Get Relevant Reason Remark".ilike.%${searchTerm}%,"Customer Order Hold Reason Category".ilike.%${searchTerm}%,"Hold Remark".ilike.%${searchTerm}%`
      );
    }

    if (!isAdmin() && currentUser && currentUser.username) {
      query = query.eq("Sales Cordinator", currentUser.username);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching enquiry tracker:", error.message);
      setIsLoading(false);
      return [];
    } else {
      const transformedData = data.map((item, index) => ({
        id: from + index + 1,
        serialNo: from + index + 1,
        Timestamp: formatDateToDDMMYYYY(item.Timestamp) || "",
        enquiryNo: item["Enquiry No."] || "",
        enquiryStatus: item["Enquiry Status"] || "",
        customerFeedback: item["What Did Customer Say"] || "",
        currentStage: item["Current Stage"] || "",
        sendQuotationNo: item["Send Quotation No."] || "",
        quotationSharedBy: item["Quotation Shared By"] || "",
        quotationNumber: item["Quotation Number"] || "",
        valueWithoutTax: item["Quotation Value Without Tax"] || "",
        valueWithTax: item["Quotation Value With Tax"] || "",
        quotationUpload: item["Quotation Upload"] || "",
        quotationRemarks: item["Quotation Remarks"] || "",
        validatorName: item["Quotation Validator Name"] || "",
        sendStatus: item["Quotation Send Status"] || "",
        validationRemark: item["Quotation Validation Remark"] || "",
        faqVideo: item["Send Faq Video"] || "",
        productVideo: item["Send Product Video"] || "",
        offerVideo: item["Send Offer Video"] || "",
        productCatalog: item["Send Product Catalog"] || "",
        productImage: item["Send Product Image"] || "",
        nextCallDate: formatDateToDDMMYYYY(item["Next Call Date"]) || "",
        nextCallTime: formatTimeTo12Hour(item["Next Call Time"]) || "",
        orderStatus: item["Is Order Received? Status"] || "",
        acceptanceVia: item["Acceptance Via"] || "",
        paymentMode: item["Payment Mode"] || "",
        paymentTerms: item["Payment Terms (In Days)"] || "",
        transportMode: item["Transport Mode"] || "",
        registrationFrom: item["CONVEYED FOR REGISTRATION FORM"] || "",
        offer: item["Offer"] || "",
        acceptanceFile: item["Acceptance File Upload"] || "",
        orderRemark: item["Remark"] || "",
        apologyVideo: item["Order Lost Apology Video"] || "",
        reasonStatus: item["If No Then Get Relevant Reason Status"] || "",
        reasonRemark: item["If No Then Get Relevant Reason Remark"] || "",
        holdReason: item["Customer Order Hold Reason Category"] || "",
        holdingDate: formatDateToDDMMYYYY(item["Holding Date"]) || "",
        holdRemark: item["Hold Remark"] || "",
        sales_coordinator: item["Sales Cordinator"] || "",
        followup_status: item["Followup Status"] || "",
        credit_days: item["Credit Days"] || "",
        credit_limit: item["Credit Limit"] || "",
        calling_days: item["Calling Days"] || "",
        order_no: item["Order No."] || "",
        sc_name: item["Sales Cordinator"] || "",
        destination: item["Destination"] || "",
        po_number: item["PO Number"] || "",
        priority: determinePriority(item["Enquiry Status"] || ""),
      }));

      console.log(
        `Received ${transformedData.length} items, total count: ${count}`
      );

      if (isLoadMore) {
        setHistoryData((prev) => {
          console.log(
            "Appending to existing history data, current length:",
            prev.length
          );
          return [...prev, ...transformedData];
        });
      } else {
        console.log("Setting new history data");
        setHistoryData(transformedData);
      }

      // Check if there's more data - fixed logic
      const hasMore =
        transformedData.length === itemsPerPage &&
        from + transformedData.length < (count || 0);
      console.log(
        `Has more history data: ${hasMore}, items received: ${transformedData.length}, total available: ${count}`
      );
      setHasMoreHistory(hasMore);

      setIsLoading(false);
      return transformedData;
    }
  };

  // 2. Fix the fetchDirectEnquiryData function with proper pagination check
  // const fetchDirectEnquiryData = async (page = 1, searchTerm = "", isLoadMore = false, dateFilters = {}) => {
  //   if (isLoadMore && !hasMoreDirectEnquiry) return;

  //   setIsLoading(true);
  //   const itemsPerPage = 50;
  //   const from = (page - 1) * itemsPerPage;
  //   const to = from + itemsPerPage - 1;

  //   let query = supabase
  //     .from("enquiry_to_order")
  //     .select("*", { count: 'exact' })
  //     .not("planned1", "is", null)
  //     .is("actual1", null)
  //     .order("enquiry_no", { ascending: true })
  //     .range(from, to);

  //   // Add date filtering for direct enquiry data
  //   if (dateFilters.today) {
  //     const today = new Date().toISOString().split('T')[0];
  //     query = query.gte('next_call_date', today).lt('next_call_date', new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  //   } else if (dateFilters.overdue) {
  //     const today = new Date().toISOString().split('T')[0];
  //     query = query.lt('next_call_date', today);
  //   } else if (dateFilters.upcoming) {
  //     const today = new Date().toISOString().split('T')[0];
  //     query = query.gt('next_call_date', today);
  //   }

  //   if (searchTerm) {
  //     query = query.or(`enquiry_no.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,sales_person_name.ilike.%${searchTerm}%`);
  //   }

  //   if (!isAdmin() && currentUser && currentUser.username) {
  //     query = query.eq("sales_coordinator_name", currentUser.username);
  //   }

  //   const { data, error, count } = await query;

  //   if (error) {
  //     console.error("Error fetching direct enquiry:", error.message);
  //     setIsLoading(false);
  //     return [];
  // } else {
  //   // ✅ Sort enquiry_no numerically (ignore 'En-' prefix)
  //   const sortedData = data.sort((a, b) => {
  //     const numA = parseInt((a.enquiry_no || "").replace("En-", ""), 10);
  //     const numB = parseInt((b.enquiry_no || "").replace("En-", ""), 10);
  //     return numA - numB;
  //   });

  //   const transformedData = sortedData.map((item, index) => ({
  //     id: from + index + 1,
  //     serialNo: from + index + 1,
  //     timestamp: formatDateToDDMMYYYY(item.timestamp) || "",
  //     enquiry_no: item.enquiry_no || "",
  //     lead_receiver_name: item.enquiry_receiver_name || "",
  //     lead_source: item.lead_source || "",
  //     phone_number: item.phone_number || "",
  //     salesperson_name: item.sales_person_name || "",
  //     company_name: item.company_name || "",
  //     current_stage: item.current_stage || "",
  //     calling_days: item.calling_days || "",
  //     priority: determinePriority(item.lead_source || ""),
  //     item_qty: formatItemQty(item.item_qty) || "",
  //     sc_name: item.sales_coordinator_name || "",
  //     nextCallDate: item.next_call_date || "",
  //   }));

  //   console.log(`Received ${transformedData.length} items, total count: ${count}`);

  // if (isLoadMore) {
  //   setDirectEnquiryData(prev => {
  //     console.log("Merging and re-sorting all enquiry data");
  //     const merged = [...prev, ...transformedData];

  //     // Re-sort globally
  //     return merged.sort((a, b) => {
  //       const numA = parseInt((a.enquiry_no || "").replace("En-", ""), 10);
  //       const numB = parseInt((b.enquiry_no || "").replace("En-", ""), 10);
  //       return numA - numB;
  //     });
  //   });
  // } else {
  //   console.log("Setting new direct enquiry data");
  //   setDirectEnquiryData(transformedData);
  // }

  //   // Check if there's more data
  //   const hasMore = transformedData.length === itemsPerPage && (from + transformedData.length) < (count || 0);
  //   console.log(`Has more direct enquiry data: ${hasMore}, items received: ${transformedData.length}, total available: ${count}`);
  //   setHasMoreDirectEnquiry(hasMore);

  //   setIsLoading(false);
  //   return transformedData;
  // }

  // };

  // 2. Fix the fetchDirectEnquiryData function to prevent duplicates
  const fetchDirectEnquiryData = async (
    page = 1,
    searchTerm = "",
    isLoadMore = false,
    dateFilters = {}
  ) => {
    if (isLoadMore && !hasMoreDirectEnquiry) return;

    setIsLoading(true);
    const itemsPerPage = 50;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from("enquiry_to_order")
      .select("*", { count: "exact" })
      .not("planned1", "is", null)
      .is("actual1", null)
      .order("enquiry_no", { ascending: true })
      .range(from, to);

    // Add date filtering for direct enquiry data
    if (dateFilters.today) {
      const today = new Date().toISOString().split("T")[0];
      query = query
        .gte("next_call_date", today)
        .lt(
          "next_call_date",
          new Date(Date.now() + 86400000).toISOString().split("T")[0]
        );
    } else if (dateFilters.overdue) {
      const today = new Date().toISOString().split("T")[0];
      query = query.lt("next_call_date", today);
    } else if (dateFilters.upcoming) {
      const today = new Date().toISOString().split("T")[0];
      query = query.gt("next_call_date", today);
    }

    if (searchTerm) {
      query = query.or(
        `enquiry_no.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,sales_person_name.ilike.%${searchTerm}%`
      );
    }

    if (!isAdmin() && currentUser && currentUser.username) {
      query = query.eq("sales_coordinator_name", currentUser.username);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching direct enquiry:", error.message);
      setIsLoading(false);
      return [];
    } else {
      // ✅ Transform data first
      const transformedData = data.map((item, index) => ({
        id: from + index + 1,
        serialNo: from + index + 1,
        timestamp: formatDateToDDMMYYYY(item.timestamp) || "",
        enquiry_no: item.enquiry_no || "",
        lead_receiver_name: item.enquiry_receiver_name || "",
        lead_source: item.lead_source || "",
        phone_number: item.phone_number || "",
        salesperson_name: item.sales_person_name || "",
        company_name: item.company_name || "",
        current_stage: item.current_stage || "",
        calling_days: item.calling_days || "",
        priority: determinePriority(item.lead_source || ""),
        item_qty: formatItemQty(item.item_qty) || "",
        sc_name: item.sales_coordinator_name || "",
        nextCallDate: item.next_call_date || "",
      }));

      // ✅ Sort by numeric part of enquiry_no (e.g., "En-1" -> 1, "En-10" -> 10)
      const sortedData = transformedData.sort((a, b) => {
        const numA =
          parseInt((a.enquiry_no || "").replace(/^En-/i, ""), 10) || 0;
        const numB =
          parseInt((b.enquiry_no || "").replace(/^En-/i, ""), 10) || 0;
        return numA - numB;
      });

      console.log(`Received ${sortedData.length} items, total count: ${count}`);

      if (isLoadMore) {
        setDirectEnquiryData((prev) => {
          // Merge with existing data and re-sort
          const existingMap = new Map(
            prev.map((item) => [item.enquiry_no, item])
          );

          // Add new items
          sortedData.forEach((item) => {
            existingMap.set(item.enquiry_no, item);
          });

          // Convert back to array and sort again
          const merged = Array.from(existingMap.values());
          return merged.sort((a, b) => {
            const numA =
              parseInt((a.enquiry_no || "").replace(/^En-/i, ""), 10) || 0;
            const numB =
              parseInt((b.enquiry_no || "").replace(/^En-/i, ""), 10) || 0;
            return numA - numB;
          });
        });
      } else {
        console.log("Setting new direct enquiry data");
        setDirectEnquiryData(sortedData);
      }

      // Check if there's more data
      const hasMore =
        sortedData.length === itemsPerPage &&
        from + sortedData.length < (count || 0);
      console.log(
        `Has more direct enquiry data: ${hasMore}, items received: ${sortedData.length}, total available: ${count}`
      );
      setHasMoreDirectEnquiry(hasMore);

      setIsLoading(false);
      return sortedData;
    }
  };

  // Add these handler functions
  const handleOrderSelect = (orderNo, isChecked) => {
    if (isChecked) {
      setSelectedOrders((prev) => [...prev, orderNo]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderNo));
    }
  };

  const handleSelectAllOrders = (isChecked) => {
    if (isChecked) {
      setSelectedOrders(tenDaysData.map((order) => order.orderNo));
    } else {
      setSelectedOrders([]);
    }
  };

  // const handleStatusChange = (orderNo, status) => {
  //   setOrderStatuses(prev => ({
  //     ...prev,
  //     [orderNo]: status
  //   }));
  // };

  const handleRemarkChange = (orderNo, remark) => {
    setOrderRemarks((prev) => ({
      ...prev,
      [orderNo]: remark,
    }));
  };

  // Update the submit function to include status and remarks
  const handleStatusChange = (orderNo, status) => {
    setOrderStatuses((prev) => ({
      ...prev,
      [orderNo]: status,
    }));

    // Clear date if status is "done"
    if (status === "done") {
      setOrderDates((prev) => ({
        ...prev,
        [orderNo]: "",
      }));
    }
  };

  // 3. Add handleDateChange function
  const handleDateChange = (orderNo, date) => {
    setOrderDates((prev) => ({
      ...prev,
      [orderNo]: date,
    }));
  };

  // 4. Update handleSubmitSelected function to include dates
  const handleSubmitSelected = async () => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order to submit");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("action", "updateTenDaysOrders");
      formData.append("sheetName", "ORDER-DISPATCH");

      // Prepare data with status, remarks, and dates
      const ordersData = selectedOrders.map((orderNo) => ({
        orderNo,
        status: orderStatuses[orderNo] || "pending",
        remark: orderRemarks[orderNo] || "",
        date: orderDates[orderNo] || "", // Add date to the data
      }));

      formData.append("ordersData", JSON.stringify(ordersData));

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Selected orders updated successfully!");
        setSelectedOrders([]);
        // Clear the status, remarks, and dates for submitted orders
        const newStatuses = { ...orderStatuses };
        const newRemarks = { ...orderRemarks };
        const newDates = { ...orderDates };
        selectedOrders.forEach((orderNo) => {
          delete newStatuses[orderNo];
          delete newRemarks[orderNo];
          delete newDates[orderNo];
        });
        setOrderStatuses(newStatuses);
        setOrderRemarks(newRemarks);
        setOrderDates(newDates);
        // Refresh the data
        fetchTenDaysData();
      } else {
        alert("Error updating orders: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting orders:", error);
      alert("Error submitting orders: " + error.message);
    }
    setIsSubmitting(false);
  };

  // 4. Create a function to convert callingDaysFilter to dateFilters object
  const getDateFiltersFromCallingDays = () => {
    const dateFilters = {};

    if (callingDaysFilter.includes("today")) {
      dateFilters.today = true;
    }

    if (callingDaysFilter.includes("overdue")) {
      dateFilters.overdue = true;
    }

    if (callingDaysFilter.includes("upcoming")) {
      dateFilters.upcoming = true;
    }

    if (callingDaysFilter.includes("older")) {
      dateFilters.older = true;
    }

    return dateFilters;
  };

  // Fetch data when tab changes or page changes
  useEffect(() => {
    if (isSearching) {
      console.log("Skipping fetch due to search in progress");
      return;
    }

    const fetchData = async () => {
      console.log("Fetching data for tab:", activeTab, "pages:", {
        pendingPage,
        historyPage,
        directEnquiryPage,
      });

      // Get date filters from callingDaysFilter
      const dateFilters = getDateFiltersFromCallingDays();

      switch (activeTab) {
        case "pending":
          await fetchPendingData(
            pendingPage,
            searchTerm,
            pendingPage > 1,
            dateFilters
          );
          break;
        case "history":
          await fetchHistoryData(
            historyPage,
            searchTerm,
            historyPage > 1,
            dateFilters
          );
          break;
        case "directEnquiry":
          await fetchDirectEnquiryData(
            directEnquiryPage,
            searchTerm,
            directEnquiryPage > 1,
            dateFilters
          );
          break;
      }
    };

    fetchData();
  }, [
    activeTab,
    pendingPage,
    historyPage,
    directEnquiryPage,
    callingDaysFilter,
  ]);

  // Handle search with debounce
  // 6. Update the search useEffect to handle date filters
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        console.log("Starting search with term:", searchTerm);
        setIsSearching(true);
        // Reset pagination and fetch with search term
        setPendingPage(1);
        setHistoryPage(1);
        setDirectEnquiryPage(1);

        // Reset hasMore flags for search
        setHasMorePending(true);
        setHasMoreHistory(true);
        setHasMoreDirectEnquiry(true);

        // Get date filters from callingDaysFilter
        const dateFilters = getDateFiltersFromCallingDays();

        const performSearch = async () => {
          switch (activeTab) {
            case "pending":
              await fetchPendingData(1, searchTerm, false, dateFilters);
              break;
            case "history":
              await fetchHistoryData(1, searchTerm, false, dateFilters);
              break;
            case "directEnquiry":
              await fetchDirectEnquiryData(1, searchTerm, false, dateFilters);
              break;
          }
          setIsSearching(false);
        };

        performSearch();
      } else if (isSearching) {
        console.log("Clearing search and resetting");
        // Clear search and reset to normal pagination
        setIsSearching(false);
        setPendingPage(1);
        setHistoryPage(1);
        setDirectEnquiryPage(1);

        // Reset hasMore flags
        setHasMorePending(true);
        setHasMoreHistory(true);
        setHasMoreDirectEnquiry(true);

        // Get date filters from callingDaysFilter
        const dateFilters = getDateFiltersFromCallingDays();

        const resetData = async () => {
          switch (activeTab) {
            case "pending":
              await fetchPendingData(1, "", false, dateFilters);
              break;
            case "history":
              await fetchHistoryData(1, "", false, dateFilters);
              break;
            case "directEnquiry":
              await fetchDirectEnquiryData(1, "", false, dateFilters);
              break;
          }
        };

        resetData();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm, activeTab, callingDaysFilter]);

  // Handle checkbox selection - populate form fields with existing data
  useEffect(() => {
    selectedOrders.forEach((orderNo) => {
      const order = tenDaysData.find((o) => o.orderNo === orderNo);
      if (order) {
        // Only set if not already set (to avoid overwriting user changes)
        if (!orderStatuses[orderNo]) {
          setOrderStatuses((prev) => ({
            ...prev,
            [orderNo]: order.existingStatus || "pending",
          }));
        }
        if (!orderDates[orderNo]) {
          setOrderDates((prev) => ({
            ...prev,
            [orderNo]: order.existingDate || "",
          }));
        }
        if (!orderRemarks[orderNo]) {
          setOrderRemarks((prev) => ({
            ...prev,
            [orderNo]: order.existingRemarks || "",
          }));
        }
      }
    });
  }, [selectedOrders, tenDaysData]);

  const LoadingIndicator = () => {
    if (!isLoading) return null;

    return (
      <div className="flex justify-center items-center py-4 bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full border-b-2 border-purple-600 animate-spin"></div>
          <span className="text-sm text-gray-600">Loading more data...</span>
        </div>
      </div>
    );
  };

  // Reset pagination when tab changes
  useEffect(() => {
    // Reset all pagination when active tab changes
    setPendingPage(1);
    setHistoryPage(1);
    setDirectEnquiryPage(1);
    setHasMorePending(true);
    setHasMoreHistory(true);
    setHasMoreDirectEnquiry(true);

    // Clear existing data to prevent stale data
    if (activeTab === "pending") {
      setPendingData([]);
    } else if (activeTab === "history") {
      setHistoryData([]);
    } else if (activeTab === "directEnquiry") {
      setDirectEnquiryData([]);
    }
  }, [activeTab]);

  useEffect(() => {
    if (
      callingDaysFilter.length > 0 ||
      enquiryNoFilter.length > 0 ||
      currentStageFilter.length > 0
    ) {
      // Reset pagination when filters are applied
      setPendingPage(1);
      setHistoryPage(1);
      setDirectEnquiryPage(1);
      setHasMorePending(true);
      setHasMoreHistory(true);
      setHasMoreDirectEnquiry(true);
    }
  }, [callingDaysFilter, enquiryNoFilter, currentStageFilter]);

  // NEW: Update available enquiry numbers when data changes or tab changes
  useEffect(() => {
    let enquiryNos = [];

    switch (activeTab) {
      case "pending":
        enquiryNos = [
          ...new Set(pendingData.map((item) => item.lead_no).filter(Boolean)),
        ];
        break;
      case "directEnquiry":
        enquiryNos = [
          ...new Set(
            directEnquiryData.map((item) => item.enquiry_no).filter(Boolean)
          ),
        ];
        break;
      case "history":
        enquiryNos = [
          ...new Set(historyData.map((item) => item.enquiryNo).filter(Boolean)),
        ];
        break;
      default:
        enquiryNos = [];
    }

    setAvailableEnquiryNos(enquiryNos.sort());
  }, [activeTab, pendingData, directEnquiryData, historyData]);

  // Filter data based on current filters
  const filterTrackers = (tracker, activeTab) => {
    // Enquiry number filter
    if (enquiryNoFilter.length > 0) {
      let enquiryNo = "";

      if (activeTab === "pending") {
        enquiryNo = tracker.lead_no || "";
      } else if (activeTab === "directEnquiry") {
        enquiryNo = tracker.enquiry_no || "";
      } else if (activeTab === "history") {
        enquiryNo = tracker.enquiryNo || "";
      }

      if (!enquiryNoFilter.includes(enquiryNo)) return false;
    }

    // Current stage filter
    if (currentStageFilter.length > 0) {
      const currentStage =
        tracker.currentStage ||
        tracker.Current_Stage ||
        tracker.current_stage ||
        "";
      if (!currentStageFilter.includes(currentStage)) return false;
    }

    // Calling days filter
    if (callingDaysFilter.length > 0) {
      let dateValue = "";
      if (activeTab === "pending") {
        dateValue = tracker.nextCallDate1 || tracker.Calling_Days || "";
      } else if (activeTab === "directEnquiry") {
        dateValue = tracker.nextCallDate || tracker.calling_days || "";
      } else if (activeTab === "history") {
        dateValue = tracker.nextCallDate || "";
      }

      if (!matchesCallingDaysFilter(dateValue, activeTab)) return false;
    }

    return true;
  };

  const filteredPendingCallTrackers = pendingData;
  const filteredHistoryCallTrackers = historyData;
  const filteredDirectEnquiryPendingTrackers = directEnquiryData;

  // NEW: Get available serial numbers based on active tab
  const getAvailableSerialNumbers = () => {
    let data = [];
    switch (activeTab) {
      case "pending":
        data = pendingData;
        break;
      case "directEnquiry":
        data = directEnquiryData;
        break;
      case "history":
        data = historyData;
        break;
      default:
        data = [];
    }
    return data.map((item) => item.serialNo).sort((a, b) => a - b);
  };

  // Toggle dropdown visibility functions
  const toggleCallingDaysDropdown = (e) => {
    e.stopPropagation();
    setShowCallingDaysDropdown(!showCallingDaysDropdown);
    setShowEnquiryNoDropdown(false);
    setShowCurrentStageDropdown(false);
    setShowSerialDropdown(false); // NEW
  };

  const toggleEnquiryNoDropdown = (e) => {
    e.stopPropagation();
    setShowEnquiryNoDropdown(!showEnquiryNoDropdown);
    setShowCallingDaysDropdown(false);
    setShowCurrentStageDropdown(false);
    setShowSerialDropdown(false); // NEW
  };

  const toggleCurrentStageDropdown = (e) => {
    e.stopPropagation();
    setShowCurrentStageDropdown(!showCurrentStageDropdown);
    setShowCallingDaysDropdown(false);
    setShowEnquiryNoDropdown(false);
    setShowSerialDropdown(false); // NEW
  };

  // NEW: Toggle serial dropdown
  const toggleSerialDropdown = (e) => {
    e.stopPropagation();
    setShowSerialDropdown(!showSerialDropdown);
    setShowCallingDaysDropdown(false);
    setShowEnquiryNoDropdown(false);
    setShowCurrentStageDropdown(false);
  };

  // Handle checkbox changes
  const handleCallingDaysChange = (value) => {
    if (callingDaysFilter.includes(value)) {
      setCallingDaysFilter(callingDaysFilter.filter((item) => item !== value));
    } else {
      setCallingDaysFilter([...callingDaysFilter, value]);
    }
  };

  const handleEnquiryNoChange = (value) => {
    if (enquiryNoFilter.includes(value)) {
      setEnquiryNoFilter(enquiryNoFilter.filter((item) => item !== value));
    } else {
      setEnquiryNoFilter([...enquiryNoFilter, value]);
    }
  };

  useEffect(() => {
    if (isSearching) {
      console.log("Skipping fetch due to search in progress");
      return;
    }

    const fetchData = async () => {
      console.log("Fetching data for tab:", activeTab, "pages:", {
        pendingPage,
        historyPage,
        directEnquiryPage,
      });

      // Get date filters from callingDaysFilter
      const dateFilters = getDateFiltersFromCallingDays();

      switch (activeTab) {
        case "pending":
          await fetchPendingData(
            pendingPage,
            searchTerm,
            pendingPage > 1,
            dateFilters
          );
          break;
        case "history":
          await fetchHistoryData(
            historyPage,
            searchTerm,
            historyPage > 1,
            dateFilters
          );
          break;
        case "directEnquiry":
          await fetchDirectEnquiryData(
            directEnquiryPage,
            searchTerm,
            directEnquiryPage > 1,
            dateFilters
          );
          break;
        case "tenDays":
          await fetchTenDaysData();
          break;
      }
    };

    fetchData();
  }, [
    activeTab,
    pendingPage,
    historyPage,
    directEnquiryPage,
    callingDaysFilter,
  ]);

  const handleCurrentStageChange = (value) => {
    if (currentStageFilter.includes(value)) {
      setCurrentStageFilter(
        currentStageFilter.filter((item) => item !== value)
      );
    } else {
      setCurrentStageFilter([...currentStageFilter, value]);
    }
  };

  // NEW: Handle serial number filter change
  const handleSerialChange = (value) => {
    if (serialFilter.includes(value)) {
      setSerialFilter(serialFilter.filter((item) => item !== value));
    } else {
      setSerialFilter([...serialFilter, value]);
    }
  };

  const fetchCallingDaysCounts = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const role = localStorage.getItem("userType");
      console.log(currentUser);
      console.log(role);

      // Helper function to conditionally apply user filter
      const withRoleFilter = (table) => {
        const query = supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        if (role === "user" && currentUser?.username) {
          return query.eq("sales_coordinator_name", currentUser.username);
        }
        return query;
      };

      // Leads to Order
      const { count: pendingToday } = await withRoleFilter("leads_to_order")
        .eq("Next Call Date_1", today)
        .is("Actual1", null);

      const { count: pendingOverdue } = await withRoleFilter("leads_to_order")
        .not("Planned1", "is", null)
        .is("Actual1", null)
        .lt("Next Call Date_1", today);

      const { count: pendingUpcoming } = await withRoleFilter("leads_to_order")
        .not("Planned1", "is", null)
        .is("Actual1", null)
        .gt("Next Call Date_1", today);

      // Enquiry to Order
      const { count: directToday } = await withRoleFilter("enquiry_to_order")
        .not("planned1", "is", null)
        .is("actual1", null)
        .gte("next_call_date", today)
        .lt("next_call_date", tomorrow);

      const { count: directOverdue } = await withRoleFilter("enquiry_to_order")
        .not("planned1", "is", null)
        .is("actual1", null)
        .lt("next_call_date", today);

      const { count: directUpcoming } = await withRoleFilter("enquiry_to_order")
        .not("planned1", "is", null)
        .is("actual1", null)
        .gt("next_call_date", today);

      // Enquiry Tracker
      const { count: historyToday } = await withRoleFilter("enquiry_tracker")
        .gte('"Next Call Date"', today)
        .lt('"Next Call Date"', tomorrow);

      const { count: historyOlder } = await withRoleFilter(
        "enquiry_tracker"
      ).lt('"Next Call Date"', today);

      setCallingDaysCounts({
        pendingToday: pendingToday || 0,
        pendingOverdue: pendingOverdue || 0,
        pendingUpcoming: pendingUpcoming || 0,
        directToday: directToday || 0,
        directOverdue: directOverdue || 0,
        directUpcoming: directUpcoming || 0,
        historyToday: historyToday || 0,
        historyOlder: historyOlder || 0,
      });
    } catch (error) {
      console.error("Error fetching calling days counts:", error);
    }
  };

  useEffect(() => {
    fetchCallingDaysCounts();
  }, []);
  //console.log(callingDaysCounts.today);
  // console.log(callingDaysCounts.overdue);
  // console.log(callingDaysCounts.upcoming);

  // Add this function inside your CallTracker component
  // Replace your calculateFilterCounts function with this:
  const calculateFilterCounts = () => {
    const counts = {
      today: 0,
      overdue: 0,
      upcoming: 0,
      older: 0,
    };

    if (activeTab === "pending") {
      pendingData.forEach((tracker) => {
        const nextCallDate1 =
          tracker.nextCallDate1 || tracker.Calling_Days || "";
        if (isToday(nextCallDate1)) counts.today++;
        else if (isOverdue(nextCallDate1)) counts.overdue++;
        else if (isUpcoming(nextCallDate1)) counts.upcoming++;
      });
    } else if (activeTab === "directEnquiry") {
      directEnquiryData.forEach((tracker) => {
        const nextCallDate = tracker.nextCallDate || tracker.calling_days || "";
        if (isToday(nextCallDate)) counts.today++;
        else if (isOverdue(nextCallDate)) counts.overdue++;
        else if (isUpcoming(nextCallDate)) counts.upcoming++;
      });
    } else if (activeTab === "history") {
      historyData.forEach((tracker) => {
        const nextCallDate = tracker.nextCallDate || "";
        if (isToday(nextCallDate)) counts.today++;
        else if (isOverdue(nextCallDate)) counts.older++;
        else if (nextCallDate) counts.older++; // Any date that's not today
      });
    }

    return counts;
  };

  const filterCounts = calculateFilterCounts();

  // Mobile Card View Component for CallTracker
  const MobileCardView = ({ data, type, onProcess, onView }) => {
    const formatItemQty = (itemQtyString) => {
      if (!itemQtyString) return "";

      try {
        const items = JSON.parse(itemQtyString);
        return items
          .filter((item) => item.name && item.quantity && item.quantity !== "0")
          .map((item) => `${item.name} : ${item.quantity}`)
          .join(", ");
      } catch (error) {
        console.error("Error parsing item quantity:", error);
        return itemQtyString;
      }
    };

    if (type === "pending") {
      return (
        <div className="space-y-4 md:hidden">
          {data.map((tracker, index) => (
            <div
              key={index}
              className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-lg"
            >
              {/* Header Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {tracker.lead_no}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      tracker.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : tracker.priority === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {tracker.Lead_Source}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="mr-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  <span>{tracker.Lead_Receiver_Name}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tracker.Company_Name}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {tracker.Phone_Number}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-xs text-gray-500">Salesperson</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tracker.salesperson_Name}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-xs text-gray-500">Call Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {tracker.Timestamp}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="mb-1 text-xs text-gray-500">Current Stage</p>
                  <p className="text-sm font-medium text-gray-900">
                    {tracker.Current_Stage}
                  </p>
                </div>

                {tracker.itemQty && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="mb-1 text-xs font-medium text-amber-600">
                      Items
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatItemQty(tracker.itemQty)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Section */}
              <div className="px-4 pb-4">
                <Link
                  state={{ activeTab: "pending", sc_name: tracker.sc_name }}
                  to={`/call-tracker/new?leadId=${tracker.lead_no}`}
                  className="flex justify-center items-center px-4 py-3 w-full text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md transition-all duration-200 hover:from-purple-700 hover:to-pink-700"
                >
                  <ArrowRightIcon className="mr-2 w-5 h-5" />
                  Process Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (type === "directEnquiry") {
      return (
        <div className="space-y-4 md:hidden">
          {data.map((tracker, index) => (
            <div
              key={index}
              className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-lg"
            >
              {/* Header Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {tracker.enquiry_no}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      tracker.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : tracker.priority === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {tracker.lead_source}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="mr-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  <span>{tracker.lead_receiver_name}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tracker.company_name}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="mb-1 text-xs text-gray-500">Call Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {tracker.timestamp}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="mb-1 text-xs text-gray-500">Current Stage</p>
                  <p className="text-sm font-medium text-gray-900">
                    {tracker.current_stage}
                  </p>
                </div>

                {tracker.item_qty && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="mb-1 text-xs font-medium text-amber-600">
                      Items
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatItemQty(tracker.item_qty)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Section */}
              <div className="flex px-4 pb-4 space-x-2">
                <Link
                  state={{
                    activeTab: "directEnquiry",
                    sc_name: tracker.sc_name,
                  }}
                  to={`/call-tracker/new?leadId=${tracker.enquiry_no}`}
                  className="flex flex-1 justify-center items-center px-4 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md transition-all duration-200 hover:from-purple-700 hover:to-pink-700"
                >
                  <ArrowRightIcon className="mr-2 w-5 h-5" />
                  Process
                </Link>
                <button
                  onClick={() => onView(tracker)}
                  className="flex-1 px-4 py-3 text-gray-700 rounded-lg border border-gray-300 transition-all duration-200 hover:bg-gray-50"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // History tab mobile view
      return (
        <div className="space-y-4 md:hidden">
          {data.map((tracker, index) => (
            <div
              key={index}
              className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-lg"
            >
              {/* Header Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {tracker.enquiryNo}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      tracker.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : tracker.priority === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {tracker.enquiryStatus}
                  </span>
                </div>
                {tracker.Timestamp && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="mr-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span>{tracker.Timestamp}</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3">
                {tracker.customerFeedback && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="flex items-center mb-1 text-xs font-medium text-blue-600">
                      <svg
                        className="mr-1 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        ></path>
                      </svg>
                      Customer Said
                    </p>
                    <p className="text-sm italic text-gray-800">
                      "{tracker.customerFeedback}"
                    </p>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="mb-1 text-xs text-gray-500">Current Stage</p>
                  <p className="text-sm font-medium text-gray-900">
                    {tracker.currentStage}
                  </p>
                </div>

                {tracker.nextCallDate && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="flex items-center mb-1 text-xs font-medium text-green-600">
                      <svg
                        className="mr-1 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                      Next Follow-up
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {tracker.nextCallDate}{" "}
                      {tracker.nextCallTime && `at ${tracker.nextCallTime}`}
                    </p>
                  </div>
                )}

                {tracker.orderStatus && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="mb-1 text-xs font-medium text-purple-600">
                      Order Status
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {tracker.orderStatus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="container px-4 py-10 mx-auto">
      <div className="flex flex-col gap-4 justify-between items-start mb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Enquiry Tracker
          </h1>
          <p className="mt-1 text-slate-600">
            Track the progress of enquiries through the sales pipeline
          </p>
          {isAdmin() && (
            <p className="mt-1 font-semibold text-green-600">
              Admin View: Showing all data
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="search"
              placeholder="Search Enquiry trackers..."
              className="pl-8 w-[200px] md:w-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Calling Days Filter */}
          {/* Calling Days Filter */}
          <div className="relative dropdown-container">
            <button
              className="flex items-center px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={toggleCallingDaysDropdown}
            >
              <span>
                Calling Days{" "}
                {callingDaysFilter.length > 0 &&
                  `(${callingDaysFilter.length})`}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ml-2 transition-transform ${
                  showCallingDaysDropdown ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showCallingDaysDropdown && (
              <div className="absolute left-0 top-full z-10 mt-1 min-w-full bg-white rounded-md border border-gray-300 shadow-lg">
                <div className="p-2">
                  {activeTab === "history" ? (
                    <>
                      <label className="flex justify-between items-center p-2 w-full cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={callingDaysFilter.includes("today")}
                            onChange={() => handleCallingDaysChange("today")}
                          />
                          <span>Today's Calls</span>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          ({callingDaysCounts.historyToday})
                        </span>
                      </label>
                      <label className="flex justify-between items-center p-2 w-full cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={callingDaysFilter.includes("older")}
                            onChange={() => handleCallingDaysChange("older")}
                          />
                          <span>Older Calls</span>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          ({callingDaysCounts.historyOlder})
                        </span>
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="flex justify-between items-center p-2 w-full cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={callingDaysFilter.includes("today")}
                            onChange={() => handleCallingDaysChange("today")}
                          />
                          <span>Today</span>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          (
                          {activeTab === "pending"
                            ? callingDaysCounts.pendingToday
                            : callingDaysCounts.directToday}
                          )
                        </span>
                      </label>
                      <label className="flex justify-between items-center p-2 w-full cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={callingDaysFilter.includes("overdue")}
                            onChange={() => handleCallingDaysChange("overdue")}
                          />
                          <span>Overdue</span>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          (
                          {activeTab === "pending"
                            ? callingDaysCounts.pendingOverdue
                            : callingDaysCounts.directOverdue}
                          )
                        </span>
                      </label>
                      <label className="flex justify-between items-center p-2 w-full cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={callingDaysFilter.includes("upcoming")}
                            onChange={() => handleCallingDaysChange("upcoming")}
                          />
                          <span>Upcoming</span>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          (
                          {activeTab === "pending"
                            ? callingDaysCounts.pendingUpcoming
                            : callingDaysCounts.directUpcoming}
                          )
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}
            {callingDaysFilter.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {callingDaysFilter.map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded"
                  >
                    {filter}
                    <button
                      onClick={() =>
                        setCallingDaysFilter(
                          callingDaysFilter.filter((item) => item !== filter)
                        )
                      }
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Enquiry No Filter */}
          {/* Enquiry No Filter */}
          <div className="relative dropdown-container">
            <button
              className="flex items-center px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={toggleEnquiryNoDropdown}
            >
              <span>
                Enquiry No.{" "}
                {enquiryNoFilter.length > 0 && `(${enquiryNoFilter.length})`}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ml-2 transition-transform ${
                  showEnquiryNoDropdown ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showEnquiryNoDropdown && (
              <div className="overflow-y-auto absolute left-0 top-full z-10 mt-1 min-w-full max-h-60 bg-white rounded-md border border-gray-300 shadow-lg">
                <div className="p-2">
                  {/* Search input for enquiry numbers */}
                  <input
                    type="text"
                    placeholder="Search enquiry numbers..."
                    className="px-2 py-1 mb-2 w-full text-sm rounded border border-gray-300"
                    onChange={(e) => {
                      // You can implement search functionality here if needed
                    }}
                  />

                  {/* Select all option */}
                  <label className="flex items-center p-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={
                        enquiryNoFilter.length === availableEnquiryNos.length &&
                        availableEnquiryNos.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEnquiryNoFilter([...availableEnquiryNos]);
                        } else {
                          setEnquiryNoFilter([]);
                        }
                      }}
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </label>

                  <div className="overflow-y-auto max-h-40">
                    {availableEnquiryNos.map((enquiryNo) => (
                      <label
                        key={enquiryNo}
                        className="flex items-center p-2 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={enquiryNoFilter.includes(enquiryNo)}
                          onChange={() => handleEnquiryNoChange(enquiryNo)}
                        />
                        <span className="text-sm">{enquiryNo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {enquiryNoFilter.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {enquiryNoFilter.slice(0, 3).map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded"
                  >
                    {filter}
                    <button
                      onClick={() =>
                        setEnquiryNoFilter(
                          enquiryNoFilter.filter((item) => item !== filter)
                        )
                      }
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {enquiryNoFilter.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded">
                    +{enquiryNoFilter.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Current Stage Filter */}
          <div className="relative dropdown-container">
            <button
              className="flex items-center px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={toggleCurrentStageDropdown}
            >
              <span>
                Current Stage{" "}
                {currentStageFilter.length > 0 &&
                  `(${currentStageFilter.length})`}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ml-2 transition-transform ${
                  showCurrentStageDropdown ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showCurrentStageDropdown && (
              <div className="absolute left-0 top-full z-10 mt-1 min-w-full bg-white rounded-md border border-gray-300 shadow-lg">
                <div className="p-2">
                  <label className="flex items-center p-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={currentStageFilter.includes("make-quotation")}
                      onChange={() =>
                        handleCurrentStageChange("make-quotation")
                      }
                    />
                    <span>Make Quotation</span>
                  </label>
                  <label className="flex items-center p-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={currentStageFilter.includes(
                        "quotation-validation"
                      )}
                      onChange={() =>
                        handleCurrentStageChange("quotation-validation")
                      }
                    />
                    <span>Quotation Validation</span>
                  </label>
                  <label className="flex items-center p-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={currentStageFilter.includes("order-status")}
                      onChange={() => handleCurrentStageChange("order-status")}
                    />
                    <span>Order Status</span>
                  </label>
                  <label className="flex items-center p-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={currentStageFilter.includes("order-expected")}
                      onChange={() =>
                        handleCurrentStageChange("order-expected")
                      }
                    />
                    <span>Order Expected</span>
                  </label>
                </div>
              </div>
            )}
            {currentStageFilter.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {currentStageFilter.map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded"
                  >
                    {filter
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    <button
                      onClick={() =>
                        setCurrentStageFilter(
                          currentStageFilter.filter((item) => item !== filter)
                        )
                      }
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Column Selection Dropdown - Only show for history tab */}
          {activeTab === "history" && (
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="flex items-center px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <span>Select Columns</span>
                <svg
                  className={`w-4 h-4 ml-2 transition-transform ${
                    showColumnDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showColumnDropdown && (
                <div className="overflow-y-auto absolute left-0 top-full z-50 mt-1 w-64 max-h-80 bg-white rounded-md border border-gray-300 shadow-lg">
                  <div className="p-2">
                    {/* Select All Option */}
                    <div className="flex items-center p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id="select-all-history"
                        checked={Object.values(visibleColumns).every(Boolean)}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                      />
                      <label
                        htmlFor="select-all-history"
                        className="ml-2 text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        All Columns
                      </label>
                    </div>

                    <hr className="my-2" />

                    {/* Individual Column Options */}
                    {columnOptions.map((option) => (
                      <div
                        key={option.key}
                        className="flex items-center p-2 rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          id={`column-${option.key}`}
                          checked={visibleColumns[option.key]}
                          onChange={() => handleColumnToggle(option.key)}
                          className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <label
                          htmlFor={`column-${option.key}`}
                          className="flex-1 ml-2 text-sm text-gray-700 cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear Filters Button */}
          {(callingDaysFilter.length > 0 ||
            enquiryNoFilter.length > 0 ||
            currentStageFilter.length > 0) && (
            <button
              className="px-3 py-2 text-sm text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={() => {
                setCallingDaysFilter([]);
                setEnquiryNoFilter([]);
                setCurrentStageFilter([]);
              }}
            >
              Clear Filters
            </button>
          )}

          <button
            className="px-4 py-2 font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            onClick={() => setShowNewCallTrackerForm(true)}
          >
            <PlusIcon className="inline-block mr-2 w-4 h-4" /> Direct Enquiry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">All Enquiry Trackers</h2>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "pending"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab("directEnquiry")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "directEnquiry"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Direct Enquiry Pending
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  activeTab === "history"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab("tenDays")}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  activeTab === "tenDays"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                10 Days
              </button>
            </div>
          </div>

          {/* {loading ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">Loading Enquiry tracker data...</p>
            </div>
          ) : */}

          <>
            {activeTab === "pending" && (
              <>
                {/* Mobile Card View */}
                <MobileCardView
                  data={filteredPendingCallTrackers}
                  type="pending"
                  onProcess={(tracker) => {
                    // Handle process action if needed
                  }}
                />
                <div className="hidden overflow-x-auto rounded-md border md:block">
                  <div className="overflow-x-auto rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Actions
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Timestamp
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Lead No.
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Lead Receiver Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Lead Source
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Phone No.
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Salesperson Name
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Company Name
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Current Stage
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Calling Date
                          </th>
                          {isAdmin() && (
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                            >
                              Assigned To
                            </th>
                          )}
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Item/Qty
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Total Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPendingCallTrackers.length > 0 ? (
                          filteredPendingCallTrackers.map((tracker, index) => (
                            <tr
                              key={tracker.id}
                              className="hover:bg-slate-50"
                              ref={
                                index === filteredPendingCallTrackers.length - 1
                                  ? lastElementRef
                                  : null
                              }
                            >
                              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <Link
                                    state={{
                                      activeTab: activeTab,
                                      sc_name: tracker.sc_name,
                                    }}
                                    to={`/call-tracker/new?leadId=${tracker.lead_no}`}
                                  >
                                    <button className="px-3 py-1 text-xs text-purple-600 rounded-md border border-purple-200 hover:bg-purple-50">
                                      Process{" "}
                                      <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                    </button>
                                  </Link>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {tracker.Timestamp}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                {tracker.lead_no}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {tracker.Lead_Receiver_Name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    tracker.priority === "High"
                                      ? "bg-red-100 text-red-800"
                                      : tracker.priority === "Medium"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-100 text-slate-800"
                                  }`}
                                >
                                  {tracker.Lead_Source}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">
                                {tracker.Phone_Number}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {tracker.salesperson_Name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <div className="flex items-center">
                                  <BuildingIcon className="mr-2 w-4 h-4 text-slate-400" />
                                  {tracker.Company_Name}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {tracker.Current_Stage}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {formatDateToDDMMYYYY(tracker.nextCallDate1)}
                              </td>
                              {isAdmin() && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.sc_name}
                                </td>
                              )}
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <div
                                  className="min-w-[100px] break-words whitespace-normal"
                                  title={tracker.itemQty}
                                >
                                  {tracker.itemQty}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {tracker.totalQty}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={isAdmin() ? 13 : 12} // Fixed: 12 base columns + 1 for admin column
                              className="px-6 py-4 text-sm text-center text-slate-500"
                            >
                              No pending call trackers found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>{" "}
                    {isLoading && activeTab === "pending" && (
                      <div className="flex justify-center py-4">
                        <div className="text-sm text-gray-500">
                          Loading more data...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "history" && (
              <>
                {/* Mobile Card View */}
                <MobileCardView
                  data={filteredHistoryCallTrackers}
                  type="history"
                />
                <div className="hidden overflow-x-auto rounded-md border md:block">
                  <div className="overflow-x-auto rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-slate-50">
                        <tr>
                          {visibleColumns.timestamp && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Timestamp
                            </th>
                          )}
                          {visibleColumns.enquiryNo && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Enquiry No.
                            </th>
                          )}
                          {visibleColumns.enquiryStatus && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Enquiry Status
                            </th>
                          )}
                          {visibleColumns.customerFeedback && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              What Did Customer Say
                            </th>
                          )}
                          {visibleColumns.currentStage && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Current Stage
                            </th>
                          )}
                          {visibleColumns.sendQuotationNo && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Send Quotation No.
                            </th>
                          )}
                          {visibleColumns.quotationSharedBy && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Quotation Shared By
                            </th>
                          )}
                          {visibleColumns.quotationNumber && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Quotation Number
                            </th>
                          )}
                          {visibleColumns.valueWithoutTax && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Quotation Value Without Tax
                            </th>
                          )}
                          {visibleColumns.valueWithTax && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Quotation Value With Tax
                            </th>
                          )}
                          {visibleColumns.quotationUpload && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Quotation Upload
                            </th>
                          )}
                          {visibleColumns.quotationRemarks && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Quotation Remarks
                            </th>
                          )}
                          {visibleColumns.validatorName && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Quotation Validator Name
                            </th>
                          )}
                          {visibleColumns.sendStatus && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Quotation Send Status
                            </th>
                          )}
                          {visibleColumns.validationRemark && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Quotation Validation Remark
                            </th>
                          )}
                          {visibleColumns.faqVideo && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Send FAQ Video
                            </th>
                          )}
                          {visibleColumns.productVideo && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Send Product Video
                            </th>
                          )}
                          {visibleColumns.offerVideo && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Send Offer Video
                            </th>
                          )}
                          {visibleColumns.productCatalog && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Send Product Catalog
                            </th>
                          )}
                          {visibleColumns.productImage && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Send Product Image
                            </th>
                          )}
                          {visibleColumns.nextCallDate && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Next Call Date
                            </th>
                          )}
                          {visibleColumns.nextCallTime && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Next Call Time
                            </th>
                          )}
                          {visibleColumns.orderStatus && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Is Order Received? Status
                            </th>
                          )}
                          {visibleColumns.acceptanceVia && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Acceptance Via
                            </th>
                          )}
                          {visibleColumns.paymentMode && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Payment Mode
                            </th>
                          )}
                          {visibleColumns.paymentTerms && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Payment Terms (In Days)
                            </th>
                          )}
                          {visibleColumns.transportMode && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Transport Mode
                            </th>
                          )}
                          {visibleColumns.registrationFrom && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              CONVEYED FOR REGISTRATION FORM
                            </th>
                          )}
                          {visibleColumns.orderVideo && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Order Video
                            </th>
                          )}
                          {visibleColumns.acceptanceFile && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Acceptance File Upload
                            </th>
                          )}
                          {visibleColumns.orderRemark && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Remark
                            </th>
                          )}
                          {visibleColumns.apologyVideo && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Order Lost Apology Video
                            </th>
                          )}
                          {visibleColumns.reasonStatus && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              If No Then Get Relevant Reason Status
                            </th>
                          )}
                          {visibleColumns.reasonRemark && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              If No Then Get Relevant Reason Remark
                            </th>
                          )}
                          {visibleColumns.holdReason && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Customer Order Hold Reason Category
                            </th>
                          )}
                          {visibleColumns.holdingDate && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Holding Date
                            </th>
                          )}
                          {visibleColumns.holdRemark && (
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Hold Remark
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredHistoryCallTrackers.length > 0 ? (
                          filteredHistoryCallTrackers.map((tracker, index) => (
                            <tr
                              key={tracker.id}
                              className="hover:bg-slate-50"
                              ref={
                                index === filteredHistoryCallTrackers.length - 1
                                  ? lastElementRef
                                  : null
                              }
                            >
                              {visibleColumns.timestamp && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.Timestamp}
                                </td>
                              )}
                              {visibleColumns.enquiryNo && (
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {tracker.enquiryNo}
                                </td>
                              )}
                              {visibleColumns.enquiryStatus && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      tracker.priority === "High"
                                        ? "bg-red-100 text-red-800"
                                        : tracker.priority === "Medium"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-100 text-slate-800"
                                    }`}
                                  >
                                    {tracker.enquiryStatus}
                                  </span>
                                </td>
                              )}
                              {visibleColumns.customerFeedback && (
                                <td
                                  className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                                  title={tracker.customerFeedback}
                                >
                                  {tracker.customerFeedback}
                                </td>
                              )}
                              {visibleColumns.currentStage && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.currentStage}
                                </td>
                              )}
                              {visibleColumns.sendQuotationNo && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.sendQuotationNo}
                                </td>
                              )}
                              {visibleColumns.quotationSharedBy && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.quotationSharedBy}
                                </td>
                              )}
                              {visibleColumns.quotationNumber && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.quotationNumber}
                                </td>
                              )}
                              {visibleColumns.valueWithoutTax && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.valueWithoutTax}
                                </td>
                              )}
                              {visibleColumns.valueWithTax && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.valueWithTax}
                                </td>
                              )}
                              {visibleColumns.quotationUpload && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.quotationUpload && (
                                    <a
                                      href={tracker.quotationUpload}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      View File
                                    </a>
                                  )}
                                </td>
                              )}
                              {visibleColumns.quotationRemarks && (
                                <td
                                  className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                                  title={tracker.quotationRemarks}
                                >
                                  {tracker.quotationRemarks}
                                </td>
                              )}
                              {visibleColumns.validatorName && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.validatorName}
                                </td>
                              )}
                              {visibleColumns.sendStatus && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.sendStatus}
                                </td>
                              )}
                              {visibleColumns.validationRemark && (
                                <td
                                  className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                                  title={tracker.validationRemark}
                                >
                                  {tracker.validationRemark}
                                </td>
                              )}
                              {visibleColumns.faqVideo && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.faqVideo}
                                </td>
                              )}
                              {visibleColumns.productVideo && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.productVideo}
                                </td>
                              )}
                              {visibleColumns.offerVideo && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.offerVideo}
                                </td>
                              )}
                              {visibleColumns.productCatalog && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.productCatalog}
                                </td>
                              )}
                              {visibleColumns.productImage && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.productImage}
                                </td>
                              )}
                              {visibleColumns.nextCallDate && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {formatDateToDDMMYYYY(tracker.nextCallDate)}
                                </td>
                              )}
                              {visibleColumns.nextCallTime && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.nextCallTime}
                                </td>
                              )}
                              {visibleColumns.orderStatus && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.orderStatus}
                                </td>
                              )}
                              {visibleColumns.acceptanceVia && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.acceptanceVia}
                                </td>
                              )}
                              {visibleColumns.paymentMode && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.paymentMode}
                                </td>
                              )}
                              {visibleColumns.paymentTerms && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.paymentTerms}
                                </td>
                              )}
                              {visibleColumns.transportMode && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.transportMode}
                                </td>
                              )}
                              {visibleColumns.registrationFrom && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.registrationFrom}
                                </td>
                              )}
                              {visibleColumns.orderVideo && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.orderVideo}
                                </td>
                              )}
                              {visibleColumns.acceptanceFile && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.acceptanceFile && (
                                    <a
                                      href={tracker.acceptanceFile}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      View File
                                    </a>
                                  )}
                                </td>
                              )}
                              {visibleColumns.orderRemark && (
                                <td
                                  className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                                  title={tracker.orderRemark}
                                >
                                  {tracker.orderRemark}
                                </td>
                              )}
                              {visibleColumns.apologyVideo && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.apologyVideo && (
                                    <a
                                      href={tracker.apologyVideo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      View Video
                                    </a>
                                  )}
                                </td>
                              )}
                              {visibleColumns.reasonStatus && (
                                <td
                                  className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                                  title={tracker.reasonStatus}
                                >
                                  {tracker.reasonStatus}
                                </td>
                              )}
                              {visibleColumns.reasonRemark && (
                                <td
                                  className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                                  title={tracker.reasonRemark}
                                >
                                  {tracker.reasonRemark}
                                </td>
                              )}
                              {visibleColumns.holdReason && (
                                <td
                                  className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                                  title={tracker.holdReason}
                                >
                                  {tracker.holdReason}
                                </td>
                              )}
                              {visibleColumns.holdingDate && (
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.holdingDate}
                                </td>
                              )}
                              {visibleColumns.holdRemark && (
                                <td
                                  className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                                  title={tracker.holdRemark}
                                >
                                  {tracker.holdRemark}
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={
                                Object.values(visibleColumns).filter(Boolean)
                                  .length
                              }
                              className="px-6 py-4 text-sm text-center text-slate-500"
                            >
                              No history found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>{" "}
                    {isLoading && activeTab === "history" && (
                      <div className="flex justify-center py-4">
                        <div className="text-sm text-gray-500">
                          Loading more data...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "directEnquiry" && (
              <>
                {/* Mobile Card View */}
                <MobileCardView
                  data={filteredDirectEnquiryPendingTrackers}
                  type="directEnquiry"
                  onProcess={(tracker) => {
                    // Handle process action if needed
                  }}
                  onView={(tracker) => {
                    setSelectedTracker(tracker);
                    setShowPopup(true);
                  }}
                />
                <div className="hidden overflow-x-auto rounded-md border md:block">
                  <div className="overflow-x-auto rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Actions
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Timestamp
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Lead No.
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Lead Source
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Company Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Current Stage
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Calling Days
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Item/Qty
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                          >
                            Total Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDirectEnquiryPendingTrackers.length > 0 ? (
                          filteredDirectEnquiryPendingTrackers.map(
                            (tracker, index) => (
                              <tr
                                key={tracker.id}
                                className="hover:bg-slate-50"
                                ref={
                                  index ===
                                  filteredDirectEnquiryPendingTrackers.length -
                                    1
                                    ? lastElementRef
                                    : null
                                }
                              >
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                  <div className="flex space-x-2">
                                    <Link
                                      state={{
                                        activeTab: activeTab,
                                        sc_name: tracker.sc_name,
                                      }}
                                      to={`/call-tracker/new?leadId=${tracker.enquiry_no}`}
                                    >
                                      <button className="px-3 py-1 text-xs text-purple-600 rounded-md border border-purple-200 hover:bg-purple-50">
                                        Process{" "}
                                        <ArrowRightIcon className="inline ml-1 w-3 h-3" />
                                      </button>
                                    </Link>
                                    <button
                                      onClick={() => {
                                        setSelectedTracker(tracker);
                                        setShowPopup(true);
                                      }}
                                      className="px-3 py-1 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    >
                                      View
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.timestamp}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {tracker.enquiry_no}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.lead_source}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.company_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      tracker.priority === "High"
                                        ? "bg-red-100 text-red-800"
                                        : tracker.priority === "Medium"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-100 text-slate-800"
                                    }`}
                                  >
                                    {tracker.current_stage}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {formatDateToDDMMYYYY(tracker.nextCallDate)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  <div
                                    className="min-w-[100px] break-words whitespace-normal"
                                    title={tracker.item_qty}
                                  >
                                    {tracker.item_qty}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {tracker.total_qty}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-6 py-4 text-sm text-center text-slate-500"
                            >
                              No direct enquiry pending trackers found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>{" "}
                    {isLoading && activeTab === "directEnquiry" && (
                      <div className="flex justify-center py-4">
                        <div className="text-sm text-gray-500">
                          Loading more data...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {activeTab === "tenDays" && (
              <>
                {/* Search Input for 10 Days - Top Right */}
                <div className="flex justify-end mb-2">
                  <div className="relative max-w-md">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Search orders..."
                      className="px-3 py-2 pl-8 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={tenDaysSearchTerm}
                      onChange={(e) => setTenDaysSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit Button - Show when orders are selected */}
                {selectedOrders.length > 0 && (
                  <div className="p-4 mb-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">
                        {selectedOrders.length} order(s) selected
                      </span>
                      <button
                        onClick={handleSubmitSelected}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Selected"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          <input
                            type="checkbox"
                            checked={
                              selectedOrders.length === tenDaysData.length &&
                              tenDaysData.length > 0
                            }
                            onChange={(e) =>
                              handleSelectAllOrders(e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </th>
                        {/* Add Status column */}
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Status
                        </th>
                        {/* Add Date column */}
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Date
                        </th>
                        {/* Add Remarks column */}
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Remarks
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Order No.
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Quotation No.
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Company Name
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Contact Person
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Contact Number
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Payment Mode
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Payment Terms
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Transport Mode
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Destination
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Item/Qty
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          PO Number
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Total Order Qty
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Amount Total
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Dispatch Status
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          CF Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tenDaysData.length > 0 ? (
                        tenDaysData
                          .filter(
                            (order) =>
                              !tenDaysSearchTerm ||
                              order.orderNo
                                .toLowerCase()
                                .includes(tenDaysSearchTerm.toLowerCase()) ||
                              order.companyName
                                .toLowerCase()
                                .includes(tenDaysSearchTerm.toLowerCase()) ||
                              order.contactPersonName
                                .toLowerCase()
                                .includes(tenDaysSearchTerm.toLowerCase()) ||
                              (order.quotationNo &&
                                order.quotationNo
                                  .toLowerCase()
                                  .includes(tenDaysSearchTerm.toLowerCase())) ||
                              (order.contactNumber &&
                                String(order.contactNumber)
                                  .toLowerCase()
                                  .includes(tenDaysSearchTerm.toLowerCase()))
                          )
                          .map((order, index) => (
                            <tr key={order.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedOrders.includes(
                                    order.orderNo
                                  )}
                                  onChange={(e) =>
                                    handleOrderSelect(
                                      order.orderNo,
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                              </td>
                              {/* Status dropdown */}
                              {/* Status cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {selectedOrders.includes(order.orderNo) ? (
                                  <select
                                    value={
                                      orderStatuses[order.orderNo] ||
                                      order.existingStatus ||
                                      "pending"
                                    }
                                    onChange={(e) =>
                                      handleStatusChange(
                                        order.orderNo,
                                        e.target.value
                                      )
                                    }
                                    className="block px-3 py-2 w-full bg-white rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="done">Done</option>
                                  </select>
                                ) : (
                                  <span className="text-sm text-gray-900">
                                    {order.existingStatus || "pending"}
                                  </span>
                                )}
                              </td>

                              {/* Date cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {selectedOrders.includes(order.orderNo) ? (
                                  (orderStatuses[order.orderNo] ||
                                    order.existingStatus ||
                                    "pending") === "pending" ? (
                                    <input
                                      type="date"
                                      value={
                                        orderDates[order.orderNo] ||
                                        order.existingDate ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleDateChange(
                                          order.orderNo,
                                          e.target.value
                                        )
                                      }
                                      className="block px-3 py-2 w-full bg-white rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )
                                ) : (
                                  <span className="text-sm text-gray-900">
                                    {order.existingDate || "-"}
                                  </span>
                                )}
                              </td>

                              {/* Remarks cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {selectedOrders.includes(order.orderNo) ? (
                                  <input
                                    type="text"
                                    value={
                                      orderRemarks[order.orderNo] ||
                                      order.existingRemarks ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleRemarkChange(
                                        order.orderNo,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter remarks"
                                    className="block px-3 py-2 w-full bg-white rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-900">
                                    {order.existingRemarks || "-"}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.timestamp}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                {order.orderNo}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.quotationNo}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.companyName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.contactPersonName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.contactNumber}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.paymentMode}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.paymentTerms}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.transportMode}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.destination}
                              </td>
                              <td
                                className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                                title={order.itemQty}
                              >
                                {order.itemQty}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.poNumber}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.totalOrderQty}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.amountTotal}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.dispatchStatus}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {order.cfDate}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={20}
                            className="px-6 py-4 text-sm text-center text-slate-500"
                          >
                            {isLoading
                              ? "Loading 10 days data..."
                              : "No orders found for 10 days criteria"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        </div>
      </div>

      {/* New Call Tracker Form Modal */}
      {showNewCallTrackerForm && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">New Call Tracker</h2>
                <button
                  onClick={() => setShowNewCallTrackerForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <CallTrackerForm />
          </div>
        </div>
      )}

      {/* View Popup Modal */}
      {showPopup && (
        <div className="flex fixed inset-0 z-50 justify-center items-center">
          <div
            className={`absolute inset-0 backdrop-blur-sm bg-black/50 ${fadeIn}`}
            onClick={() => setShowPopup(false)}
          ></div>
          <div
            className={`overflow-auto relative w-full max-w-3xl bg-white rounded-lg shadow-xl max-h-[90vh] ${slideIn}`}
          >
            <div className="flex sticky top-0 justify-between items-center p-4 bg-white border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {activeTab === "pending" || activeTab === "directEnquiry"
                  ? `Call Tracker Details: ${selectedTracker?.leadId}`
                  : `Call Tracker History: ${selectedTracker?.enquiryNo}`}
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {activeTab === "pending" || activeTab === "directEnquiry" ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Column B - Lead ID */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Lead Number
                    </p>
                    <p className="text-base font-semibold">
                      {selectedTracker?.leadId}
                    </p>
                  </div>

                  {/* Column C - Receiver Name */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Lead Receiver Name
                    </p>
                    <p className="text-base">{selectedTracker?.receiverName}</p>
                  </div>

                  {/* Column D - Lead Source */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Lead Source
                    </p>
                    <p className="text-base">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedTracker?.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : selectedTracker?.priority === "Medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {selectedTracker?.leadSource}
                      </span>
                    </p>
                  </div>

                  {/* Column E - Salesperson Name */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Salesperson Name
                    </p>
                    <p className="text-base">
                      {selectedTracker?.salespersonName}
                    </p>
                  </div>

                  {/* Column G - Company Name */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Company Name
                    </p>
                    <p className="text-base">{selectedTracker?.companyName}</p>
                  </div>

                  {/* Created Date */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Created Date
                    </p>
                    <p className="text-base">{selectedTracker?.createdAt}</p>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-base">{selectedTracker?.status}</p>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Priority
                    </p>
                    <p className="text-base">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedTracker?.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : selectedTracker?.priority === "Medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {selectedTracker?.priority}
                      </span>
                    </p>
                  </div>

                  {/* Stage */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Stage</p>
                    <p className="text-base">{selectedTracker?.stage}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Enquiry No */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Enquiry No.
                    </p>
                    <p className="text-base font-semibold">
                      {selectedTracker?.enquiryNo}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Timestamp
                    </p>
                    <p className="text-base">{selectedTracker?.timestamp}</p>
                  </div>

                  {/* Enquiry Status */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Enquiry Status
                    </p>
                    <p className="text-base">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedTracker?.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : selectedTracker?.priority === "Medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {selectedTracker?.enquiryStatus}
                      </span>
                    </p>
                  </div>

                  {/* Current Stage */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Current Stage
                    </p>
                    <p className="text-base">{selectedTracker?.currentStage}</p>
                  </div>

                  {/* Next Call Date */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Next Call Date
                    </p>
                    <p className="text-base">{selectedTracker?.nextCallDate}</p>
                  </div>

                  {/* Next Call Time */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Next Call Time
                    </p>
                    <p className="text-base">{selectedTracker?.nextCallTime}</p>
                  </div>

                  {/* Holding Date */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Holding Date
                    </p>
                    <p className="text-base">{selectedTracker?.holdingDate}</p>
                  </div>

                  {/* Order Status */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Order Status
                    </p>
                    <p className="text-base">{selectedTracker?.orderStatus}</p>
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Payment Mode
                    </p>
                    <p className="text-base">{selectedTracker?.paymentMode}</p>
                  </div>

                  {/* Payment Terms */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Payment Terms
                    </p>
                    <p className="text-base">{selectedTracker?.paymentTerms}</p>
                  </div>
                </div>
              )}

              {/* Customer Feedback - Full width */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">
                  What Did Customer Say
                </p>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-base">
                    {activeTab === "pending" || activeTab === "directEnquiry"
                      ? "No feedback yet"
                      : selectedTracker?.customerFeedback}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4 space-x-3 border-t">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Close
              </button>
              {(activeTab === "pending" || activeTab === "directEnquiry") && (
                <Link
                  to={`/call-tracker/new?leadId=${selectedTracker?.leadId}`}
                >
                  <button className="px-4 py-2 font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    Process <ArrowRightIcon className="inline ml-1 w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallTracker;
