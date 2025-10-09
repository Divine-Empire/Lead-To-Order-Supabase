"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, ArrowRightIcon } from "../components/Icons"
import { AuthContext } from "../App"
import supabase from "../utils/supabase"

const slideIn = "animate-in slide-in-from-right duration-300"
const slideOut = "animate-out slide-out-to-right duration-300"
const fadeIn = "animate-in fade-in duration-300"
const fadeOut = "animate-out fade-out duration-300"

// Custom hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

function FollowUp() {
  const isMobile = useIsMobile();
  const { currentUser, userType, isAdmin } = useContext(AuthContext)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [pendingFollowUps, setPendingFollowUps] = useState([])
  const [historyFollowUps, setHistoryFollowUps] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [showPopup, setShowPopup] = useState(false)
  const [selectedFollowUp, setSelectedFollowUp] = useState(null)
  const [companyFilter, setCompanyFilter] = useState("all")
  const [personFilter, setPersonFilter] = useState("all")
  const [phoneFilter, setPhoneFilter] = useState("all")

  // Fixed pagination state management
  const [pendingPage, setPendingPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [hasMorePending, setHasMorePending] = useState(true)
  const [hasMoreHistory, setHasMoreHistory] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)
  

  const [visibleColumns, setVisibleColumns] = useState({
    timestamp: true,
    leadNo: true,
    companyName: true,
    customerSay: true,
    status: true,
    enquiryStatus: true,
    receivedDate: true,
    state: true,
    projectName: true,
    salesType: true,
    productDate: true,
    projectValue: true,
    item1: true,
    qty1: true,
    item2: true,
    qty2: true,
    item3: true,
    qty3: true,
    item4: true,
    qty4: true,
    item5: true,
    qty5: true,
    nextAction: true,
    callDate: true,
    callTime: true,
    itemQty: true,
  })
  const [showColumnDropdown, setShowColumnDropdown] = useState(false)

  // Helper functions
  const determinePriority = (source) => {
    if (!source) return "Low"
    const sourceLower = source.toLowerCase()
    if (sourceLower.includes("indiamart")) return "High"
    if (sourceLower.includes("website")) return "Medium"
    return "Low"
  }

  const formatNextCallTime = (timeValue) => {
    if (!timeValue) return ""

    try {
      if (typeof timeValue === "string" && timeValue.startsWith("Date(")) {
        const timeString = timeValue.substring(5, timeValue.length - 1)
        const [year, month, day, hours, minutes, seconds] = timeString
          .split(",")
          .map((part) => Number.parseInt(part.trim()))

        const formattedHours = hours % 12 || 12
        const period = hours >= 12 ? "PM" : "AM"
        const formattedMinutes = minutes.toString().padStart(2, "0")

        return `${formattedHours}:${formattedMinutes} ${period}`
      }

      if (typeof timeValue === "string" && /^\d{2}:\d{2}:\d{2}$/.test(timeValue)) {
        const [hours, minutes] = timeValue.split(":").map(Number)
        const formattedHours = hours % 12 || 12
        const period = hours >= 12 ? "PM" : "AM"
        const formattedMinutes = minutes.toString().padStart(2, "0")

        return `${formattedHours}:${formattedMinutes} ${period}`
      }

      return timeValue
    } catch (error) {
      console.error("Error formatting time:", error)
      return timeValue
    }
  }

  const formatDateToDDMMYYYY = (dateValue) => {
    if (!dateValue) return ""

    try {
      if (typeof dateValue === "string" && dateValue.includes('-')) {
        const [year, month, day] = dateValue.split('-')
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
      }

      if (typeof dateValue === "string" && dateValue.startsWith("Date(")) {
        const dateString = dateValue.substring(5, dateValue.length - 1)
        const [year, month, day] = dateString.split(",").map((part) => Number.parseInt(part.trim()))

        return `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${year}`
      }

      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
      }

      return dateValue
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateValue
    }
  }

  // ✅ Filter History tab using Timestamp (not calling_days)
const checkDateFilterHistory = (followUp, filterType) => {
  if (filterType === "all") return true;
  if (!followUp.timestamp) return false;

  try {
    const [day, month, year] = followUp.timestamp.split("/");
    const followUpDate = new Date(year, month - 1, day);
    followUpDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterType === "today") return followUpDate.getTime() === today.getTime();
    if (filterType === "older") return followUpDate < today;
    return true;
  } catch (err) {
    console.error("Error in checkDateFilterHistory:", err);
    return false;
  }
};


  const formatItemQty = (itemQtyString) => {
    if (!itemQtyString) return ""
    
    try {
      const items = JSON.parse(itemQtyString)
      return items
        .filter(item => item.name && item.quantity && item.quantity !== "0")
        .map(item => `${item.name} : ${item.quantity}`)
        .join(", ")
    } catch (error) {
      console.error("Error parsing item quantity:", error)
      return itemQtyString
    }
  }

  const checkDateFilter = (followUp, filterType) => {
    if (filterType === "all") return true

    const nextCallDate = followUp.nextCallDate
    if (!nextCallDate) return false

    try {
      let followUpDate;
      
      if (nextCallDate.includes('-')) {
        const [year, month, day] = nextCallDate.split('-')
        followUpDate = new Date(year, month - 1, day)
      } else if (nextCallDate.includes('/')) {
        const [day, month, year] = nextCallDate.split('/')
        followUpDate = new Date(year, month - 1, day)
      } else {
        followUpDate = new Date(nextCallDate)
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      followUpDate.setHours(0, 0, 0, 0)

      switch (filterType) {
        case "today":
          return followUpDate.getTime() === today.getTime()
        case "overdue":
          return followUpDate < today
        case "upcoming":
          return followUpDate > today
        default:
          return true
      }
    } catch (error) {
      console.error("Error parsing date:", error, "Date value:", nextCallDate)
      return false
    }
  }

  const calculateDateFilterCounts = () => {
    const counts = {
      today: 0,
      overdue: 0,
      upcoming: 0,
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    pendingFollowUps.forEach((followUp) => {
      const nextCallDate = followUp.nextCallDate
      if (!nextCallDate) return

      try {
        let followUpDate;
        
        if (nextCallDate.includes('-')) {
          const [year, month, day] = nextCallDate.split('-')
          followUpDate = new Date(year, month - 1, day)
        } else if (nextCallDate.includes('/')) {
          const [day, month, year] = nextCallDate.split('/')
          followUpDate = new Date(year, month - 1, day)
        } else {
          followUpDate = new Date(nextCallDate)
        }
        
        followUpDate.setHours(0, 0, 0, 0)

        if (followUpDate.getTime() === today.getTime()) {
          counts.today++
        } else if (followUpDate < today) {
          counts.overdue++
        } else if (followUpDate > today) {
          counts.upcoming++
        }
      } catch (error) {
        console.error("Error parsing date:", error, "Date value:", nextCallDate)
      }
    })

    return counts
  }

  // ✅ Count history calls (Today / Older)
const calculateHistoryCounts = () => {
  let today = 0, older = 0;
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  historyFollowUps.forEach((f) => {
    if (!f.timestamp) return;
    try {
      const [day, month, year] = f.timestamp.split("/");
      const d = new Date(year, month - 1, day);
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === current.getTime()) today++;
      else if (d < current) older++;
    } catch (err) {
      console.error("Error counting history calls:", err);
    }
  });

  return { today, older };
};


  // Fixed scroll detection function
  const isBottom = () => {
    return window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 100;
  };

  // Fixed function to fetch data with pagination
// Replace the existing fetchFollowUpData function with this updated version:

const fetchFollowUpData = useCallback(async (page = 1, isLoadMore = false, searchTerm = "") => {
  try {
    console.log(`Fetching data - Page: ${page}, LoadMore: ${isLoadMore}, ActiveTab: ${activeTab}`);
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    const itemsPerPage = 50;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

   if (activeTab === "pending") {
  let pendingQuery = supabase
    .from('leads_to_order')
    .select('*', { count: 'exact' })
    .not('Planned', 'is', null)
    .is('Actual', null);

  // Apply search filter to the query BEFORE pagination
  if (searchTerm) {
    pendingQuery = pendingQuery.or(`Company_Name.ilike.%${searchTerm}%,"LD-Lead-No".ilike.%${searchTerm}%,Salesperson_Name.ilike.%${searchTerm}%,Phone_Number.ilike.%${searchTerm}%,Lead_Source.ilike.%${searchTerm}%,Location.ilike.%${searchTerm}%,"What_Did_The_Customer say?".ilike.%${searchTerm}%,Enquiry_Received_Status.ilike.%${searchTerm}%,SC_Name.ilike.%${searchTerm}%`);
  }

  // Apply user filter if not admin
  if (!isAdmin() && currentUser && currentUser.username) {
    pendingQuery = pendingQuery.eq('SC_Name', currentUser.username);
  }

  // Add sorting by lead number (LD-Lead-No) in ascending order
  pendingQuery = pendingQuery.order('id', { ascending: true });

  // Apply pagination with range
  pendingQuery = pendingQuery.range(from, to);

  const { data, error, count } = await pendingQuery;

      if (error) throw error;

      console.log(`Fetched ${data?.length || 0} pending records for page ${page}`);

      const filteredPending = (data || []).map(row => ({
        timestamp: row.Next_Call_Date ? formatDateToDDMMYYYY(row.Next_Call_Date) : "",
        id: row.id || "",
        leadId: row['LD-Lead-No'] || "",
        companyName: row['Company_Name'] || "",
        personName: row['Salesperson_Name'] || "",
        phoneNumber: row['Phone_Number'] || "",
        leadSource: row['Lead_Source'] || "",
        location: row['Location'] || "",
        customerSay: row['What_Did_The_Customer say?'] || "",
        enquiryStatus: row['Enquiry_Status'] || "",
        enquiryReceivedStatus: row["Enquiry_Received_Status"] || "",
        createdAt: row['Created_At'] || "",
        nextCallDate: row['Next_Call_Date'] || "",
        callingDays: row['Calling_Days'] || "",
        priority: determinePriority(row['Lead_Source'] || ""),
        assignedTo: row['SC_Name'] || row['assigned_user'] || "",
        itemQty: row['Item_Qty'] || ""
      }));

      if (isLoadMore) {
        setPendingFollowUps(prev => [...prev, ...filteredPending]);
      } else {
        setPendingFollowUps(filteredPending);
      }

      // Check if there's more data based on count and current data length
      const totalCount = count || 0;
      const currentDataLength = isLoadMore ? 
        (pendingFollowUps.length + filteredPending.length) : 
        filteredPending.length;
      
      const hasMore = currentDataLength < totalCount;
      setHasMorePending(hasMore);
      
      console.log(`HasMorePending: ${hasMore}, Current: ${currentDataLength}, Total: ${totalCount}`);

    } else {
      // History tab data fetching
      let historyQuery = supabase
        .from('leads_tracker')
        .select('*', { count: 'exact' });

      // Apply search filter to the query BEFORE pagination
      if (searchTerm) {
        historyQuery = historyQuery.or(`"LD-Lead-No".ilike.%${searchTerm}%,"What_Did_The_Customer say?".ilike.%${searchTerm}%,Leads_Tracking_Status.ilike.%${searchTerm}%,Enquiry_Received_Status.ilike.%${searchTerm}%,Enquiry_for_State.ilike.%${searchTerm}%,Project_Name.ilike.%${searchTerm}%,Enquiry_Type.ilike.%${searchTerm}%,Next_Action.ilike.%${searchTerm}%,SC_Name.ilike.%${searchTerm}%`);
      }

      // Apply user filter if not admin
      if (!isAdmin() && currentUser && currentUser.username) {
        historyQuery = historyQuery.eq('SC_Name', currentUser.username);
      }

      // Apply pagination with range
      historyQuery = historyQuery.range(from, to);

      const { data, error, count } = await historyQuery;

      if (error) throw error;

      console.log(`Fetched ${data?.length || 0} history records for page ${page}`);

      const filteredHistory = (data || []).map(row => ({
  timestamp: row["Timestamp"] ? formatDateToDDMMYYYY(row["Timestamp"]) : "",
  leadNo: row["LD-Lead-No"] || "",
  companyName: row["Company_Name"] || "",
  customerSay: row["What_Did_The_Customer_say?"] || "",
  status: row["Leads_Tracking_Status"] || "",
  enquiryStatus: row["Enquiry_Received_Status"] || "", // This line was missing the correct mapping
  enquiryReceivedStatus: row["Enquiry_Received_Status"] || "",
  enquiryReceivedDate: row["Enquiry_Received_Date"] ? formatDateToDDMMYYYY(row["Enquiry_Received_Date"]) : "",
  enquiryState: row["Enquiry_for_State"] || "",
  projectName: row["Project_Name"] || "",
  salesType: row["Enquiry_Type"] || "",
  requiredProductDate: "",
  projectApproxValue: row["Project_Approximate_Value"] || "",
  itemName1: row["Item_Name1"] || "",
  quantity1: row["Quantity1"] || "",
  itemName2: row["Item_Name2"] || "",
  quantity2: row["Quantity2"] || "",
  itemName3: row["Item_Name3"] || "",
  quantity3: row["Quantity3"] || "",
  itemName4: row["Item_Name4"] || "",
  quantity4: row["Quantity4"] || "",
  itemName5: row["Item_Name5"] || "",
  quantity5: row["Quantity5"] || "",
  nextAction: row["Next_Action"] || "",
  nextCallDate: row["Next_Call_Date"] ? formatDateToDDMMYYYY(row["Next_Call_Date"]) : "",
  nextCallTime: row["Next_Call_Time"] ? formatNextCallTime(row["Next_Call_Time"]) : "",
  historyDateFilter: "",
  assignedTo: row.SC_Name || row.assigned_user || "",
  itemQty: row.Item_Qty || ""
}));

      if (isLoadMore) {
        setHistoryFollowUps(prev => [...prev, ...filteredHistory]);
      } else {
        setHistoryFollowUps(filteredHistory);
      }

      // Check if there's more data based on count and current data length
      const totalCount = count || 0;
      const currentDataLength = isLoadMore ? 
        (historyFollowUps.length + filteredHistory.length) : 
        filteredHistory.length;
      
      const hasMore = currentDataLength < totalCount;
      setHasMoreHistory(hasMore);
      
      console.log(`HasMoreHistory: ${hasMore}, Current: ${currentDataLength}, Total: ${totalCount}`);
    }

  } catch (error) {
    console.error("Error fetching follow-up data:", error);
    
    // Keep existing fallback logic...
  } finally {
    setIsLoading(false);
    setIsLoadingMore(false);
  }
}, [currentUser, isAdmin, activeTab]);


// Remove or comment out these filter functions since filtering now happens at database level:

// const filteredPendingFollowUps = pendingFollowUps.filter((followUp) => {
//   ... existing filter logic ...
// })

// const filteredHistoryFollowUps = historyFollowUps.filter((followUp) => {
//   ... existing filter logic ...
// })


// Replace the filter variables with direct usage:
// Change all instances of `filteredPendingFollowUps` to `pendingFollowUps`
// Change all instances of `filteredHistoryFollowUps` to `historyFollowUps`

// Update the loadMoreData function to pass the current page correctly:
const loadMoreData = useCallback(() => {
  if (isLoadingMore) return;
  
  if (activeTab === "pending" && hasMorePending) {
    console.log(`Loading more pending data, page: ${pendingPage + 1}`);
    fetchFollowUpData(pendingPage + 1, true, searchTerm);
    setPendingPage(prev => prev + 1);
  } else if (activeTab === "history" && hasMoreHistory) {
    console.log(`Loading more history data, page: ${historyPage + 1}`);
    fetchFollowUpData(historyPage + 1, true, searchTerm);
    setHistoryPage(prev => prev + 1);
  }
}, [activeTab, isLoadingMore, hasMorePending, hasMoreHistory, pendingPage, historyPage, searchTerm, fetchFollowUpData]);

  // Fixed scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isBottom() && !isLoadingMore && !isLoading) {
        if ((activeTab === "pending" && hasMorePending) || 
            (activeTab === "history" && hasMoreHistory)) {
          loadMoreData();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, isLoading, activeTab, hasMorePending, hasMoreHistory, loadMoreData]);

  // Reset pagination when changing tabs
  useEffect(() => {
    console.log(`Tab changed to: ${activeTab}`);
    setPendingPage(1);
    setHistoryPage(1);
    setHasMorePending(true);
    setHasMoreHistory(true);
    fetchFollowUpData(1, false, searchTerm);
  }, [activeTab, currentUser]);

  // Debounced search function
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      console.log(`Search term changed: ${searchTerm}`);
      setPendingPage(1);
      setHistoryPage(1);
      setHasMorePending(true);
      setHasMoreHistory(true);
      fetchFollowUpData(1, false, searchTerm);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  // Filter function for search in both sections
  const filteredPendingFollowUps = pendingFollowUps.filter((followUp) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      (followUp.companyName && followUp.companyName.toLowerCase().includes(searchLower)) ||
      (followUp.leadId && followUp.leadId.toLowerCase().includes(searchLower)) ||
      (followUp.personName && followUp.personName.toLowerCase().includes(searchLower)) ||
      (followUp.phoneNumber && followUp.phoneNumber.toString().toLowerCase().includes(searchLower)) ||
      (followUp.leadSource && followUp.leadSource.toLowerCase().includes(searchLower)) ||
      (followUp.location && followUp.location.toLowerCase().includes(searchLower)) ||
      (followUp.customerSay && followUp.customerSay.toLowerCase().includes(searchLower)) ||
      (followUp.enquiryReceivedStatus && followUp.enquiryReceivedStatus.toLowerCase().includes(searchLower)) ||
      (followUp.assignedTo && followUp.assignedTo.toLowerCase().includes(searchLower))

    const matchesFilterType = (() => {
      if (filterType === "first") {
        return followUp.enquiryReceivedStatus === "" || followUp.enquiryReceivedStatus === null
      } else if (filterType === "multi") {
        return followUp.enquiryReceivedStatus === "expected"
      } else {
        return true
      }
    })()

    const matchesDateFilter = checkDateFilter(followUp, dateFilter)
    const matchesCompanyFilter = companyFilter === "all" || followUp.companyName === companyFilter
    const matchesPersonFilter = personFilter === "all" || followUp.personName === personFilter
    const phoneToCompare = followUp.phoneNumber ? followUp.phoneNumber.toString().trim() : ""
    const matchesPhoneFilter = phoneFilter === "all" || phoneToCompare === phoneFilter.toString().trim()

    return (
      matchesSearch &&
      matchesFilterType &&
      matchesDateFilter &&
      matchesCompanyFilter &&
      matchesPersonFilter &&
      matchesPhoneFilter
    )
  })

  useEffect(() => {
    if (activeTab !== "pending") {
      setCompanyFilter("all")
      setPersonFilter("all")
      setPhoneFilter("all")
    }
  }, [activeTab])

  const filteredHistoryFollowUps = historyFollowUps.filter((followUp) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      (followUp.leadNo && followUp.leadNo.toString().toLowerCase().includes(searchLower)) ||
      (followUp.customerSay && followUp.customerSay.toLowerCase().includes(searchLower)) ||
      (followUp.status && followUp.status.toLowerCase().includes(searchLower)) ||
      (followUp.enquiryReceivedStatus && followUp.enquiryReceivedStatus.toLowerCase().includes(searchLower)) ||
      (followUp.enquiryReceivedDate && followUp.enquiryReceivedDate.toLowerCase().includes(searchLower)) ||
      (followUp.enquiryState && followUp.enquiryState.toLowerCase().includes(searchLower)) ||
      (followUp.projectName && followUp.projectName.toLowerCase().includes(searchLower)) ||
      (followUp.salesType && followUp.salesType.toLowerCase().includes(searchLower)) ||
      (followUp.requiredProductDate && followUp.requiredProductDate.toLowerCase().includes(searchLower)) ||
      (followUp.projectApproxValue && followUp.projectApproxValue.toString().toLowerCase().includes(searchLower)) ||
      (followUp.itemName1 && followUp.itemName1.toLowerCase().includes(searchLower)) ||
      (followUp.itemName2 && followUp.itemName2.toLowerCase().includes(searchLower)) ||
      (followUp.itemName3 && followUp.itemName3.toLowerCase().includes(searchLower)) ||
      (followUp.itemName4 && followUp.itemName4.toLowerCase().includes(searchLower)) ||
      (followUp.itemName5 && followUp.itemName5.toLowerCase().includes(searchLower)) ||
      (followUp.nextAction && followUp.nextAction.toLowerCase().includes(searchLower)) ||
      (followUp.nextCallDate && followUp.nextCallDate.toLowerCase().includes(searchLower)) ||
      (followUp.nextCallTime && followUp.nextCallTime.toLowerCase().includes(searchLower))

    const matchesFilterType = (() => {
      if (filterType === "first") {
        return (
          followUp.enquiryReceivedStatus === "" ||
          followUp.enquiryReceivedStatus === null ||
          followUp.enquiryReceivedStatus === "New"
        )
      } else if (filterType === "multi") {
        return followUp.enquiryReceivedStatus === "Expected" || followUp.enquiryReceivedStatus === "expected"
      } else {
        return true
      }
    })()

    // const matchesDateFilter = checkDateFilter(followUp, dateFilter)
    const matchesDateFilter = checkDateFilterHistory(followUp, dateFilter)


    return matchesSearch && matchesFilterType && matchesDateFilter
  })

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }))
  }

  const handleSelectAll = () => {
    const allSelected = Object.values(visibleColumns).every(Boolean)
    const newState = Object.fromEntries(Object.keys(visibleColumns).map((key) => [key, !allSelected]))
    setVisibleColumns(newState)
  }

  const columnOptions = [
    { key: "timestamp", label: "Timestamp" },
    { key: "leadNo", label: "Lead No." },
    { key: "companyName", label: "Company Name" },
    { key: "customerSay", label: "Customer Say" },
    { key: "status", label: "Status" },
    { key: "enquiryStatus", label: "Enquiry Status" },
    { key: "receivedDate", label: "Received Date" },
    { key: "state", label: "State" },
    { key: "projectName", label: "Project Name" },
    { key: "salesType", label: "Sales Type" },
    { key: "productDate", label: "Product Date" },
    { key: "projectValue", label: "Project Value" },
    { key: "item1", label: "Item 1" },
    { key: "qty1", label: "Qty 1" },
    { key: "item2", label: "Item 2" },
    { key: "qty2", label: "Qty 2" },
    { key: "item3", label: "Item 3" },
    { key: "qty3", label: "Qty 3" },
    { key: "item4", label: "Item 4" },
    { key: "qty4", label: "Qty 4" },
    { key: "item5", label: "Item 5" },
    { key: "qty5", label: "Qty 5" },
    { key: "nextAction", label: "Next Action" },
    { key: "callDate", label: "Call Date" },
    { key: "callTime", label: "Call Time" },
    { key: "itemQty", label: "Item/Qty" },
  ]

  const dateFilterCounts = calculateDateFilterCounts()
  const historyCounts = calculateHistoryCounts();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnDropdown && !event.target.closest(".relative")) {
        setShowColumnDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showColumnDropdown])

  // Mobile Card View Component
const MobileCardView = ({ data, type }) => {
  if (type === 'pending') {
    return (
      <div className="space-y-4 md:hidden">
        {data.map((followUp, index) => (
          <div key={`${followUp.leadId}-${index}`} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-900 text-lg">{followUp.leadId}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  followUp.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : followUp.priority === "Medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-700"
                }`}>
                  {followUp.leadSource}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span>{followUp.personName}</span>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Company</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{followUp.companyName}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{followUp.phoneNumber}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Call Date</p>
                <p className="text-sm font-medium text-gray-900">{followUp.timestamp}</p>
              </div>
              
              {followUp.customerSay && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium mb-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                    Customer Said
                  </p>
                  <p className="text-sm text-gray-800 italic">"{followUp.customerSay}"</p>
                </div>
              )}
              
              {isAdmin() && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900">{followUp.assignedTo}</p>
                </div>
              )}
              
              {followUp.itemQty && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 font-medium mb-1">Items</p>
                  <p className="text-sm font-medium text-gray-900">{formatItemQty(followUp.itemQty)}</p>
                </div>
              )}
            </div>
            
            {/* Action Section */}
            <div className="px-4 pb-4">
              <Link 
                state={followUp.assignedTo} 
                to={`/follow-up/new?leadId=${followUp.leadId}&leadNo=${followUp.leadId}`}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg shadow-md hover:from-violet-700 hover:to-blue-700 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Call Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    // History tab mobile view
    return (
      <div className="space-y-4 md:hidden">
        {data.map((followUp, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-900 text-lg">{followUp.leadNo}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  followUp.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : followUp.status === "Pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}>
                  {followUp.status}
                </span>
              </div>
              {followUp.timestamp && (
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{followUp.timestamp}</span>
                </div>
              )}
            </div>
            
            {/* Content Section */}
            <div className="p-4 space-y-3">
              {followUp.customerSay && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium mb-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                    Customer Said
                  </p>
                  <p className="text-sm text-gray-800 italic">"{followUp.customerSay}"</p>
                </div>
              )}
              
              {followUp.enquiryStatus && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Enquiry Status</p>
                  <p className="text-sm font-medium text-gray-900">{followUp.enquiryStatus}</p>
                </div>
              )}
              
              {followUp.nextCallDate && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <p className="text-xs text-green-600 font-medium mb-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Next Follow-up
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {followUp.nextCallDate} {followUp.nextCallTime && `at ${followUp.nextCallTime}`}
                  </p>
                </div>
              )}
              
              {followUp.itemQty && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 font-medium mb-1">Items</p>
                  <p className="text-sm font-medium text-gray-900">{formatItemQty(followUp.itemQty)}</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-4 sm:py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:justify-between lg:items-start mb-6 lg:mb-8">
          {/* Title Section */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              Call Tracker
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Track and manage all your follow-up calls</p>
            {isAdmin() && <p className="text-green-600 font-semibold mt-1 text-sm">Admin View: Showing all data</p>}
          </div>

          {/* Filters Section */}
          <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:space-x-3 lg:items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 lg:gap-3">
              {/* Company Name Filter - Only show for pending tab */}
              {activeTab === "pending" && (
                <div className="min-w-0">
                  <input
                    list="company-options"
                    value={companyFilter === "all" ? "" : companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value || "all")}
                    placeholder="Select or type company"
                    className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <datalist id="company-options">
                    <option value="all">All Companies</option>
                    {Array.from(new Set(pendingFollowUps.map((item) => item.companyName)))
                      .filter(Boolean)
                      .map((company) => (
                        <option key={company} value={company} />
                      ))}
                  </datalist>
                </div>
              )}

              {/* Person Name Filter - Only show for pending tab */}
              {activeTab === "pending" && (
                <div className="min-w-0">
                  <input
                    list="person-options"
                    value={personFilter === "all" ? "" : personFilter}
                    onChange={(e) => setPersonFilter(e.target.value || "all")}
                    placeholder="Select or type person"
                    className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <datalist id="person-options">
                    <option value="all">All Persons</option>
                    {Array.from(new Set(pendingFollowUps.map((item) => item.personName)))
                      .filter(Boolean)
                      .map((person) => (
                        <option key={person} value={person} />
                      ))}
                  </datalist>
                </div>
              )}

              {/* Phone Number Filter - Only show for pending tab */}
              {activeTab === "pending" && (
                <div className="min-w-0">
                  <input
                    list="phone-options"
                    value={phoneFilter === "all" ? "" : phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value || "all")}
                    placeholder="Select or type number"
                    className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <datalist id="phone-options">
                    <option value="all">All Numbers</option>
                    {Array.from(
                      new Set(
                        pendingFollowUps
                          .map((item) => (item.phoneNumber ? item.phoneNumber.toString().trim() : ""))
                          .filter(Boolean),
                      ),
                    ).map((phone) => (
                      <option key={phone} value={phone} />
                    ))}
                  </datalist>
                </div>
              )}

              {/* Date Filter */}
              <div className="min-w-0">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">All</option>
                {activeTab === "pending" ? (
  <>
    <option value="today">Today ({dateFilterCounts.today})</option>
    <option value="overdue">Overdue ({dateFilterCounts.overdue})</option>
    <option value="upcoming">Upcoming ({dateFilterCounts.upcoming})</option>
  </>
) : (
  <>
    <option value="today">Today's Calls ({historyCounts.today})</option>
    <option value="older">Older Calls ({historyCounts.older})</option>
  </>
)}

                </select>
              </div>

              {/* Column Selection Dropdown - Only show for history tab */}
              {activeTab === "history" && (
                <div className="min-w-0 relative">
                  <button
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white flex items-center justify-between"
                  >
                    <span>Select Columns</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showColumnDropdown ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showColumnDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                      <div className="p-2">
                        {/* Select All Option */}
                        <div className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id="select-all"
                            checked={Object.values(visibleColumns).every(Boolean)}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                          />
                          <label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-900 cursor-pointer">
                            All Columns
                          </label>
                        </div>

                        <hr className="my-2" />

                        {/* Individual Column Options */}
                        {columnOptions.map((option) => (
                          <div key={option.key} className="flex items-center p-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              id={`column-${option.key}`}
                              checked={visibleColumns[option.key]}
                              onChange={() => handleColumnToggle(option.key)}
                              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`column-${option.key}`}
                              className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
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

              {/* Filter Dropdown */}
              <div className="min-w-0">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">All</option>
                  <option value="first">First Followup</option>
                  <option value="multi">Expected</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-auto lg:min-w-[250px]">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="search"
                placeholder="Search Call Tracker..."
                className="pl-8 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">All Call Tracker</h2>
          </div>

          {/* Card Content */}
          <div className="p-4 sm:p-6">
            {/* Tab Navigation */}
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex w-full sm:w-auto rounded-md shadow-sm">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${
                    activeTab === "pending"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-white text-slate-700 hover:bg-slate-50 border-gray-300"
                  } border`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${
                    activeTab === "history"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-white text-slate-700 hover:bg-slate-50 border-gray-300"
                  } border border-l-0`}
                >
                  History
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <p className="text-slate-500 mt-4">Loading follow-up data...</p>
              </div>
            ) : (
              <>
                {/* Content Tables/Cards */}
                {activeTab === "pending" && (
                  <>
                    {/* Mobile Card View */}
                    <MobileCardView data={filteredPendingFollowUps} type="pending" />
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="sticky left-0 z-10 bg-slate-50 px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                                >
                                  Actions
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Call Date
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Lead No.
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Company Name
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Person Name
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Phone No.
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Lead Source
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Location
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Customer Say
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Enquiry Status
                                </th>
                                {isAdmin() && (
                                  <th
                                    scope="col"
                                    className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                  >
                                    Assigned To
                                  </th>
                                )}
                                <th
                                  scope="col"
                                  className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Item/Qty
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredPendingFollowUps.length > 0 ? (
                                filteredPendingFollowUps.map((followUp, index) => (
                                  <tr key={`${followUp.leadId}-${index}`} className="hover:bg-slate-50 transition-colors">
                                    <td className="sticky left-0 z-10 bg-white px-3 sm:px-4 py-3 sm:py-4 text-sm font-medium border-r border-gray-200">
                                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                                        <Link state={followUp.assignedTo} to={`/follow-up/new?leadId=${followUp.leadId}&leadNo=${followUp.leadId}`}>
                                          <button className="w-full sm:w-auto px-2 sm:px-3 py-1 text-xs border border-amber-200 text-amber-600 hover:bg-amber-50 rounded-md transition-colors whitespace-nowrap">
                                            Call Now <ArrowRightIcon className="ml-1 h-3 w-3 inline" />
                                          </button>
                                        </Link>
                                      </div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                      {followUp.timestamp}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                      {followUp.leadId}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                      <div
                                        className="max-w-[120px] sm:max-w-[150px] truncate"
                                        title={followUp.companyName}
                                      >
                                        {followUp.companyName}
                                      </div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                      <div
                                        className="max-w-[100px] sm:max-w-[120px] truncate"
                                        title={followUp.personName}
                                      >
                                        {followUp.personName}
                                      </div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                      {followUp.phoneNumber}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          followUp.priority === "High"
                                            ? "bg-red-100 text-red-800"
                                            : followUp.priority === "Medium"
                                              ? "bg-amber-100 text-amber-800"
                                              : "bg-slate-100 text-slate-800"
                                        }`}
                                      >
                                        {followUp.leadSource}
                                      </span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                      <div className="max-w-[100px] sm:max-w-[120px] truncate" title={followUp.location}>
                                        {followUp.location}
                                      </div>
                                    </td>
                                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
  <div
    className="max-w-[150px] sm:max-w-[200px] whitespace-normal break-words"
    title={followUp.customerSay}
  >
    {followUp.customerSay}
  </div>
</td>

                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                      <div
                                        className="max-w-[100px] sm:max-w-[120px] truncate"
                                        title={followUp.enquiryStatus}
                                      >
                                        {followUp.enquiryStatus}
                                      </div>
                                    </td>
                                    {isAdmin() && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.assignedTo}
                                      </td>
                                    )}
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                      <div
                                        className="min-w-[300px] break-words whitespace-normal"
                                        title={formatItemQty(followUp.itemQty)}
                                      >
                                        {formatItemQty(followUp.itemQty)}
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={isAdmin() ? 12 : 11}
                                    className="px-4 py-8 text-center text-sm text-slate-500"
                                  >
                                    <div className="flex flex-col items-center space-y-2">
                                      <svg
                                        className="h-12 w-12 text-gray-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={1}
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                      <p>No pending follow-ups found</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* History Tab Content */}
                {activeTab === "history" && (
                  <>
                    {/* Mobile Card View */}
                    <MobileCardView data={filteredHistoryFollowUps} type="history" />
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr>
                                {visibleColumns.timestamp && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Timestamp
                                  </th>
                                )}
                                {visibleColumns.leadNo && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Lead No.
                                  </th>
                                )}
                                {visibleColumns.companyName && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Company Name
                                  </th>
                                )}
                                {visibleColumns.customerSay && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Customer Say
                                  </th>
                                )}
                                {visibleColumns.status && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Status
                                  </th>
                                )}
                                {visibleColumns.enquiryStatus && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Enquiry Status
                                  </th>
                                )}
                                {visibleColumns.receivedDate && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Received Date
                                  </th>
                                )}
                                {visibleColumns.state && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    State
                                  </th>
                                )}
                                {visibleColumns.projectName && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Project Name
                                  </th>
                                )}
                                {visibleColumns.salesType && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Sales Type
                                  </th>
                                )}
                                {visibleColumns.productDate && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Product Date
                                  </th>
                                )}
                                {visibleColumns.projectValue && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Project Value
                                  </th>
                                )}
                                {visibleColumns.item1 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Item 1
                                  </th>
                                )}
                                {visibleColumns.qty1 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Qty 1
                                  </th>
                                )}
                                {visibleColumns.item2 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Item 2
                                  </th>
                                )}
                                {visibleColumns.qty2 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Qty 2
                                  </th>
                                )}
                                {visibleColumns.item3 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Item 3
                                  </th>
                                )}
                                {visibleColumns.qty3 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Qty 3
                                  </th>
                                )}
                                {visibleColumns.item4 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Item 4
                                  </th>
                                )}
                                {visibleColumns.qty4 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Qty 4
                                  </th>
                                )}
                                {visibleColumns.item5 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Item 5
                                  </th>
                                )}
                                {visibleColumns.qty5 && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Qty 5
                                  </th>
                                )}
                                {visibleColumns.nextAction && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Next Action
                                  </th>
                                )}
                                {visibleColumns.callDate && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Call Date
                                  </th>
                                )}
                                {visibleColumns.callTime && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Call Time
                                  </th>
                                )}
                                {visibleColumns.itemQty && (
                                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Item/Qty
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredHistoryFollowUps.length > 0 ? (
                                filteredHistoryFollowUps.map((followUp, index) => (
                                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    {visibleColumns.timestamp && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.timestamp}
                                      </td>
                                    )}
                                    {visibleColumns.leadNo && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                        {followUp.leadNo}
                                      </td>
                                    )}
                                    {visibleColumns.companyName && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[120px] sm:max-w-[150px] truncate"
                                          title={followUp.companyName}
                                        >
                                          {followUp.companyName}
                                        </div>
                                      </td>
                                    )}
                                {visibleColumns.customerSay && (
  <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
    <div
      className="max-w-[150px] sm:max-w-[200px] whitespace-normal break-words"
      title={followUp.customerSay}
    >
      {followUp.customerSay}
    </div>
  </td>
)}

                                    {visibleColumns.status && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            followUp.status === "Completed"
                                              ? "bg-green-100 text-green-800"
                                              : followUp.status === "Pending"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {followUp.status}
                                        </span>
                                      </td>
                                    )}
                                    {visibleColumns.enquiryStatus && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[100px] sm:max-w-[120px] truncate"
                                          title={followUp.enquiryStatus}
                                        >
                                          {followUp.enquiryStatus}
                                        </div>
                                      </td>
                                    )}
                                    {visibleColumns.receivedDate && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.enquiryReceivedDate}
                                      </td>
                                    )}
                                    {visibleColumns.state && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[80px] sm:max-w-[100px] truncate"
                                          title={followUp.enquiryState}
                                        >
                                          {followUp.enquiryState}
                                        </div>
                                      </td>
                                    )}
                                    {visibleColumns.projectName && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[100px] sm:max-w-[120px] truncate"
                                          title={followUp.projectName}
                                        >
                                          {followUp.projectName}
                                        </div>
                                      </td>
                                    )}
                                    {visibleColumns.salesType && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.salesType}
                                      </td>
                                    )}
                                    {visibleColumns.productDate && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.requiredProductDate}
                                      </td>
                                    )}
                                    {visibleColumns.projectValue && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.projectApproxValue}
                                      </td>
                                    )}
                                    {visibleColumns.item1 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[100px] sm:max-w-[120px] truncate"
                                          title={followUp.itemName1}
                                        >
                                          {followUp.itemName1}
                                        </div>
                                      </td>
                                    )}
                                    {visibleColumns.qty1 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.quantity1}
                                      </td>
                                    )}
                                    {visibleColumns.item2 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[100px] sm:max-w-[120px] truncate"
                                          title={followUp.itemName2}
                                        >
                                          {followUp.itemName2}
                                        </div>
                                      </td>
                                    )}
                                    {visibleColumns.qty2 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.quantity2}
                                      </td>
                                    )}
                                    {visibleColumns.item3 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[100px] sm:max-w-[120px] truncate"
                                          title={followUp.itemName3}
                                        >
                                          {followUp.itemName3}
                                        </div>
                                      </td>
                                    )}
                                    {visibleColumns.qty3 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.quantity3}
                                      </td>
                                    )}
                                    {visibleColumns.item4 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[100px] sm:max-w-[120px] truncate"
                                          title={followUp.itemName4}
                                        >
                                          {followUp.itemName4}
                                        </div>
                                      </td>
                                    )}
                                    {visibleColumns.qty4 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.quantity4}
                                      </td>
                                    )}
                                    {visibleColumns.item5 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[100px] sm:max-w-[120px] truncate"
                                          title={followUp.itemName5}
                                        >
                                          {followUp.itemName5}
                                        </div>
                                      </td>
                                    )}
                                    {visibleColumns.qty5 && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.quantity5}
                                      </td>
                                    )}
                                    {visibleColumns.nextAction && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="max-w-[100px] sm:max-w-[120px] truncate"
                                          title={followUp.nextAction}
                                        >
                                          {followUp.nextAction}
                                        </div>
                                      </td>
                                    )}
                                    {visibleColumns.callDate && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.nextCallDate}
                                      </td>
                                    )}
                                    {visibleColumns.callTime && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {followUp.nextCallTime}
                                      </td>
                                    )}
                                    {visibleColumns.itemQty && (
                                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-500">
                                        <div
                                          className="min-w-[300px] break-words whitespace-normal"
                                          title={formatItemQty(followUp.itemQty)}
                                        >
                                          {formatItemQty(followUp.itemQty)}
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={Object.values(visibleColumns).filter(Boolean).length}
                                    className="px-4 py-8 text-center text-sm text-slate-500"
                                  >
                                    <div className="flex flex-col items-center space-y-2">
                                      <svg
                                        className="h-12 w-12 text-gray-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={1}
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                      <p>No history found</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Loading indicator */}
                {isLoadingMore && (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading more data...</span>
                  </div>
                )}

                {/* End of data message */}
                {!isLoading && 
                 ((activeTab === "pending" && !hasMorePending && pendingFollowUps.length > 0) ||
                  (activeTab === "history" && !hasMoreHistory && historyFollowUps.length > 0)) && (
                  <div className="text-center py-4 text-gray-500">
                    You've reached the end of the data
                  </div>
                )}

                {/* No results message */}
                {!isLoading && 
                 ((activeTab === "pending" && pendingFollowUps.length === 0) ||
                  (activeTab === "history" && historyFollowUps.length === 0)) && (
                  <div className="text-center py-8 text-gray-500">
                    No results found
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FollowUp