"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../App";
import supabase from "../utils/supabase";
import { BarChartIcon, PhoneCallIcon, FileTextIcon, ShoppingCartIcon, UsersIcon } from "../components/Icons";
import { MapPin } from "lucide-react";

// import { supabaseVisit } from "../supabaseClientVisit";


// FOS Team Members List
const FOS_RECEIVERS = [
    "PRANAV VINAYAKRAO BHOGAWAR",
    "RANJAN KUMAR PRUSTY",
    "SAMIRAN RAJBONGSHI",
    "ROSHAN DEWANGAN",
    "TUSHAR ATRAM",
    "SUBHRAJIT BEHERA",
    "MANOSH ROY",
    "AMAN JHA"
];

function Report() {
    const { isAdmin } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("calling"); // "calling" or "fos"

    // calling report state
    const [metrics, setMetrics] = useState({
        totalLeads: 0,
        calls: 0,
        enquiries: 0,
        quotations: 0,
        orders: 0,
        quotationValue: 0,
    });
    const [filters, setFilters] = useState({
        scName: "all",
        startDate: "",
        endDate: "",
    });
    const [scNames, setScNames] = useState([]);

    // FOS report state
    const [fosMetrics, setFosMetrics] = useState({
        enquiryCount: 0,
        totalValue: 0,
        orderConvert: 0,
    });

    // Total Visit (Tankhwa Patra)
    const [totalVisitCount, setTotalVisitCount] = useState(0);

    // Pipeline state (for non-converted enquiries)
    const [pipelineMetrics, setPipelineMetrics] = useState({
        enquiryCount: 0,
        totalValue: 0,
    });

    const [fosFilters, setFosFilters] = useState({
        receiverName: "all",
        startDate: "",
        endDate: "",
    });

    const [isLoading, setIsLoading] = useState(true);

    // Helper to format date for query if needed, or use directly
    const getEndDateWithTime = (date) => {
        if (!date) return null
        return `${date}T23:59:59`
    }

    // Fetch unique SC names for the filter dropdown
    const fetchSCNames = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("login")
                .select("username")
                .order("username", { ascending: true });

            if (error) {
                console.error("Error fetching SC names from login:", error);
                return;
            }

            const uniqueNames = (data || []).map(item => item.username).filter(Boolean);
            setScNames(uniqueNames);
        } catch (error) {
            console.error("Error fetching SC names:", error);
        }
    }, []);

    const fetchMetrics = useCallback(async () => {
        if (!isAdmin()) return;
        setIsLoading(true);
        try {
            // Helper to parse dates strictly
            const parseDate = (dateStr) => {
                if (!dateStr) return null;
                // Handle ISO format
                const isoDate = new Date(dateStr);
                if (!isNaN(isoDate.getTime()) && dateStr.includes("-")) {
                    return isoDate;
                }
                // Handle DD/MM/YYYY format
                const parts = dateStr.split(" ")[0].split("/");
                if (parts.length === 3) {
                    // components: [DD, MM, YYYY]
                    // new Date(YYYY, MM-1, DD)
                    return new Date(parts[2], parts[1] - 1, parts[0]);
                }
                return null;
            };

            const isDateInRange = (date, start, end) => {
                if (!date) return false;
                const target = new Date(date).getTime();
                const s = start ? new Date(start).setHours(0, 0, 0, 0) : null;
                const e = end ? new Date(end).setHours(23, 59, 59, 999) : null;

                if (s && target < s) return false;
                if (e && target > e) return false;
                return true;
            };

            // 1. Fetch Calls (leads_tracker)
            let callsQuery = supabase.from("leads_tracker").select("*", { count: "exact", head: true });
            if (filters.scName !== "all") callsQuery = callsQuery.eq("SC_Name", filters.scName);
            if (filters.startDate) callsQuery = callsQuery.gte("Timestamp", filters.startDate);
            if (filters.endDate) callsQuery = callsQuery.lte("Timestamp", filters.endDate);

            const { count: callsCount, error: callsError } = await callsQuery;
            if (callsError) console.error("Error fetching calls:", callsError);


            // 2, 3, 4 & 5. Fetch Total Leads, Enquiries, Quotations & Orders (leads_to_order)
            let leadsQuery = supabase
                .from("leads_to_order")
                .select("Planned1, Actual1, SC_Name, Quotation_Number, Timestamp, Quotation_Value_Without_Tax")

            if (filters.scName !== "all") {
                leadsQuery = leadsQuery.eq("SC_Name", filters.scName);
            }

            const { data: leadsData, error: leadsError } = await leadsQuery;

            let totalLeadCount = 0;
            let enquiryCount = 0;
            let orderCount = 0;
            let quotationCount = 0;
            let totalQuotationValue = 0;

            if (leadsError) {
                console.error("Error fetching leads_to_order:", leadsError);
            } else if (leadsData) {
                leadsData.forEach(row => {
                    const pDate = parseDate(row.Planned1);
                    const aDate = row.Actual1 ? parseDate(row.Actual1) : null;
                    const tDate = parseDate(row.Timestamp);

                    // Total Leads
                    if (tDate) {
                        if (isDateInRange(tDate, filters.startDate, filters.endDate)) {
                            totalLeadCount++;
                        }
                    }

                    // Enquiries
                    if (row.Planned1) {
                        if (isDateInRange(pDate, filters.startDate, filters.endDate)) {
                            enquiryCount++;
                        }
                    }

                    // Orders
                    if (row.Planned1 && row.Actual1) {
                        if (isDateInRange(aDate, filters.startDate, filters.endDate)) {
                            orderCount++;
                        }
                    }

                    // Quotations
                    if (row.Planned1 && row.Quotation_Number) {
                        if (isDateInRange(pDate, filters.startDate, filters.endDate)) {
                            quotationCount++;
                            // Handle Quotation Value
                            if (row.Quotation_Value_Without_Tax) {
                                const value = parseFloat(String(row.Quotation_Value_Without_Tax).replace(/,/g, '').replace(/[^\d.-]/g, ''));
                                if (!isNaN(value)) {
                                    totalQuotationValue += value;
                                }
                            }
                        }
                    }
                });
            }

            setMetrics({
                totalLeads: totalLeadCount,
                calls: callsCount || 0,
                enquiries: enquiryCount,
                quotations: quotationCount,
                orders: orderCount,
                quotationValue: totalQuotationValue,
            });

        } catch (error) {
            console.error("Error fetching report metrics:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters, isAdmin]);

    // Fetch FOS Data
    const fetchFosMetrics = useCallback(async () => {
        if (!isAdmin() || activeTab !== "fos") return;
        setIsLoading(true);
        try {
            let query = supabase
                .from("enquiry_to_order")
                .select("id, amount_with_gst, order_no, is_order_received_status, created_at, enquiry_receiver_name, actual1");

            if (fosFilters.receiverName !== "all") {
                query = query.eq("enquiry_receiver_name", fosFilters.receiverName);
            }
            if (fosFilters.startDate) {
                query = query.gte("created_at", fosFilters.startDate);
            }
            if (fosFilters.endDate) {
                query = query.lte("created_at", getEndDateWithTime(fosFilters.endDate));
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching FOS data:", error);
                setFosMetrics({ enquiryCount: 0, totalValue: 0, orderConvert: 0 });
                setPipelineMetrics({ enquiryCount: 0, totalValue: 0 });
                return;
            }

            // FOS Team metrics (all enquiries)
            let fosEnquiryCount = data.length;
            let fosTotalValue = 0;
            let orderConvert = 0;

            // Pipeline metrics (only non-converted: actual1 is null)
            let pipelineEnquiryCount = 0;
            let pipelineTotalValue = 0;

            data.forEach(row => {
                // Check for Order Conversion (either order_no exists or status says yes)
                const hasOrder = row.order_no || (row.is_order_received_status && row.is_order_received_status.toLowerCase() === 'yes');

                if (hasOrder) {
                    orderConvert++;
                    if (row.amount_with_gst) {
                        fosTotalValue += Number(row.amount_with_gst) || 0;
                    }
                }

                // Pipeline: Count only enquiries where actual1 is null (not converted)
                if (!row.actual1) {
                    pipelineEnquiryCount++;
                    if (row.amount_with_gst) {
                        pipelineTotalValue += Number(row.amount_with_gst) || 0;
                    }
                }
            });

            setFosMetrics({
                enquiryCount: fosEnquiryCount,
                totalValue: fosTotalValue,
                orderConvert
            });

            setPipelineMetrics({
                enquiryCount: pipelineEnquiryCount,
                totalValue: pipelineTotalValue
            });

        } catch (err) {
            console.error("FOS fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [fosFilters, activeTab, isAdmin]);


    useEffect(() => {
        fetchSCNames();
    }, [fetchSCNames]);


    const fetchFilteredVisitCount = useCallback(async () => {
        if (!isAdmin() || activeTab !== "fos") return;

        try {
            const isUnfiltered = fosFilters.receiverName === "all" && !fosFilters.startDate && !fosFilters.endDate;

            if (isUnfiltered) {
                // 📊 Default logic: Sum of total_visit table + Count of tankhwa_patra table
                const [
                    { data: visitSumData, error: visitError },
                    { count: patraCount, error: patraError }
                ] = await Promise.all([
                    supabase.from('total_visit').select('total_visit'),
                    supabase.from('tankhwa_patra').select('*', { count: 'exact', head: true })
                ]);

                if (!visitError && !patraError) {
                    const visitSum = (visitSumData || []).reduce((acc, row) => acc + (Number(row.total_visit) || 0), 0);
                    setTotalVisitCount(visitSum + (patraCount || 0));
                } else {
                    console.error("Default visit fetch error:", visitError || patraError);
                    setTotalVisitCount(0);
                }
                return;
            }

            // 🔍 Filtered logic: Only tankhwa_patra with JS filtering
            let query = supabase
                .from("tankhwa_patra")
                .select("Name, \"Punch In Time\"");

            // 👤 Receiver Name filter (using fuzzy ilike for "Mr. NAME (PHONE)")
            if (fosFilters.receiverName !== "all") {
                query = query.ilike("Name", `%${fosFilters.receiverName}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Tankhwa Patra visit error:", error);
                setTotalVisitCount(0);
                return;
            }

            let filteredData = data || [];

            // 📅 Date filters in JS due to format "DD-MM-YYYY HH:mm:ss"
            const startDate = fosFilters.startDate ? new Date(fosFilters.startDate).setHours(0, 0, 0, 0) : null;
            const endDate = fosFilters.endDate ? new Date(fosFilters.endDate).setHours(23, 59, 59, 999) : null;

            if (startDate || endDate) {
                filteredData = filteredData.filter(row => {
                    const punchInTime = row["Punch In Time"];
                    if (!punchInTime) return false;

                    // Parse "DD-MM-YYYY HH:mm:ss"
                    const parts = punchInTime.split(" ")[0].split("-");
                    if (parts.length === 3) {
                        const day = parseInt(parts[0], 10);
                        const month = parseInt(parts[1], 10) - 1;
                        const year = parseInt(parts[2], 10);
                        const punchDate = new Date(year, month, day).getTime();

                        if (startDate && punchDate < startDate) return false;
                        if (endDate && punchDate > endDate) return false;
                        return true;
                    }
                    return false;
                });
            }

            // ✅ Each row after filtering = 1 visit
            setTotalVisitCount(filteredData.length);

        } catch (err) {
            console.error("Visit count error:", err);
        }
    }, [fosFilters, activeTab, isAdmin]);

    useEffect(() => {
        if (activeTab === "calling") {
            fetchMetrics();
        } else {
            fetchFosMetrics();
            fetchFilteredVisitCount();
        }
    }, [fetchMetrics, fetchFosMetrics, fetchFilteredVisitCount, activeTab]);

    if (!isAdmin()) {
        return <div className="p-8 text-center text-red-600">Access Denied</div>;
    }










    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Overview of calls, enquiries, quotations, and orders.
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("calling")}
                            className={`${activeTab === "calling"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Calling Data
                        </button>
                        <button
                            onClick={() => setActiveTab("fos")}
                            className={`${activeTab === "fos"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            FOS Report
                        </button>
                    </nav>
                </div>

                {/* CALLING DATA TAB CONTENT */}
                {activeTab === "calling" && (
                    <>
                        {/* Filters */}
                        <div className="bg-white p-4 rounded-lg shadow mb-8 flex flex-col md:flex-row gap-4 items-end md:items-center">
                            <div className="w-full md:w-1/4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">SC Name</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    value={filters.scName}
                                    onChange={(e) => setFilters(prev => ({ ...prev, scName: e.target.value }))}
                                >
                                    <option value="all">All Sales Coordinators</option>
                                    {scNames.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full md:w-1/4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="w-full md:w-1/4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                            <div className="w-full md:w-1/4">
                                <button
                                    onClick={() => setFilters({ scName: "all", startDate: "", endDate: "" })}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                            {/* Card 0: Total Leads */}
                            <div className="bg-white rounded-lg shadow px-4 py-6 flex items-center">
                                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                                    <UsersIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Leads</p>
                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">{isLoading ? "..." : metrics.totalLeads}</p>
                                </div>
                            </div>

                            {/* Card 1: Calls */}
                            <div className="bg-white rounded-lg shadow px-4 py-6 flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-3">
                                    <PhoneCallIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">No. of Calls</p>
                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">{isLoading ? "..." : metrics.calls}</p>
                                </div>
                            </div>

                            {/* Card 2: Enquiries */}
                            <div className="bg-white rounded-lg shadow px-6 py-6 flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                    <BarChartIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Enquiries</p>
                                    <p className="text-2xl font-semibold text-gray-900">{isLoading ? "..." : metrics.enquiries}</p>
                                </div>
                            </div>

                            {/* Card 3: Quotations */}
                            <div className="bg-white rounded-lg shadow px-6 py-6 flex items-center">
                                <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                                    <FileTextIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Quotations</p>
                                    <p className="text-2xl font-semibold text-gray-900">{isLoading ? "..." : metrics.quotations}</p>
                                </div>
                            </div>

                            {/* Card 4: Orders */}
                            <div className="bg-white rounded-lg shadow px-6 py-6 flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                    <ShoppingCartIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                                    <p className="text-2xl font-semibold text-gray-900">{isLoading ? "..." : metrics.orders}</p>
                                </div>
                            </div>

                            {/* Card 5: Total Quotation Value */}
                            <div className="bg-white rounded-lg shadow px-6 py-6 flex items-center">
                                <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
                                    <span className="text-2xl font-bold">₹</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Quotation Value</p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        {isLoading ? "..." : (metrics.quotationValue || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* FOS REPORT TAB CONTENT */}
                {activeTab === "fos" && (
                    <>
                        {/* FOS Filters */}
                        <div className="bg-white p-4 rounded-lg shadow mb-8 flex flex-col md:flex-row gap-4 items-end md:items-center">
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enquiry Receiver Name</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    value={fosFilters.receiverName}
                                    onChange={(e) => setFosFilters(prev => ({ ...prev, receiverName: e.target.value }))}
                                >
                                    <option value="all">All Receivers</option>
                                    {FOS_RECEIVERS.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full md:w-1/4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    value={fosFilters.startDate}
                                    onChange={(e) => setFosFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="w-full md:w-1/4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    value={fosFilters.endDate}
                                    onChange={(e) => setFosFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                            <div className="w-full md:w-1/6">
                                <button
                                    onClick={() => setFosFilters({ receiverName: "all", startDate: "", endDate: "" })}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* FOS Team and Pipeline Sections */}
                        <div className="space-y-12">
                            {/* Section 1: FOS Team */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">FOS Team</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Total Visit */}
                                    <div className="bg-white rounded-lg shadow px-6 py-8 flex items-center justify-between border-l-4 border-blue-500">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Total Visit
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {isLoading ? "..." : totalVisitCount}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                                            <MapPin className="h-8 w-8" />
                                        </div>
                                    </div>



                                    {/* No. of Enquiry */}
                                    <div className="bg-white rounded-lg shadow px-6 py-8 flex items-center justify-between border-l-4 border-indigo-500">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">No. of Enquiries</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? "..." : fosMetrics.enquiryCount}</p>
                                        </div>
                                        <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                                            <UsersIcon className="h-8 w-8" />
                                        </div>
                                    </div>

                                    {/* Value */}
                                    <div className="bg-white rounded-lg shadow px-6 py-8 flex items-center justify-between border-l-4 border-green-500">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Value</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {isLoading ? "..." : (fosMetrics.totalValue || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-full bg-green-50 text-green-600">
                                            <span className="text-2xl font-bold">₹</span>
                                        </div>
                                    </div>

                                    {/* Order Convert */}
                                    <div className="bg-white rounded-lg shadow px-6 py-8 flex items-center justify-between border-l-4 border-purple-500">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Orders Converted</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? "..." : fosMetrics.orderConvert}</p>
                                        </div>
                                        <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                                            <ShoppingCartIcon className="h-8 w-8" />
                                        </div>
                                    </div>

                                    {/* Avg Ticket Size */}
                                    <div className="bg-white rounded-lg shadow px-6 py-8 flex items-center justify-between border-l-4 border-amber-500">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Ticket Size</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {isLoading ? "..." : fosMetrics.orderConvert > 0
                                                    ? (fosMetrics.totalValue / fosMetrics.orderConvert).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                                                    : '₹0.00'}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-full bg-amber-50 text-amber-600">
                                            <span className="text-2xl font-bold">₹</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Pipeline (Non-converted Enquiries Only) */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pipeline</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* No. of Enquiry (Non-converted only) */}
                                    <div className="bg-white rounded-lg shadow px-6 py-8 flex items-center justify-between border-l-4 border-indigo-500">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">No. of Enquiries</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? "..." : pipelineMetrics.enquiryCount}</p>
                                        </div>
                                        <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                                            <UsersIcon className="h-8 w-8" />
                                        </div>
                                    </div>

                                    {/* Value (Non-converted only) */}
                                    <div className="bg-white rounded-lg shadow px-6 py-8 flex items-center justify-between border-l-4 border-green-500">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Value</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {isLoading ? "..." : (pipelineMetrics.totalValue || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-full bg-green-50 text-green-600">
                                            <span className="text-2xl font-bold">₹</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

export default Report;
