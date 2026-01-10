"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../App";
import supabase from "../utils/supabase";
import { BarChartIcon, PhoneCallIcon, FileTextIcon, ShoppingCartIcon, UsersIcon } from "../components/Icons";

function Report() {
  const { isAdmin } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    calls: 0,
    enquiries: 0,
    quotations: 0,
    orders: 0,
  });
  const [filters, setFilters] = useState({
    scName: "all",
    startDate: "",
    endDate: "",
  });
  const [scNames, setScNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to format date for query if needed, or use directly
  const getEndDateWithTime = (date) => {
      if (!date) return null
      return `${date}T23:59:59`
  }

  // Fetch unique SC names for the filter dropdown
  const fetchSCNames = useCallback(async () => {
    try {
      // User request: fetch sc name from login table username column
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
            const s = start ? new Date(start).setHours(0,0,0,0) : null;
            const e = end ? new Date(end).setHours(23,59,59,999) : null;
            
            if (s && target < s) return false;
            if (e && target > e) return false;
            return true;
        };

        // 1. Fetch Calls (leads_tracker) - Keep existing logic or update if needed.
        // For now, assuming leads_tracker Timestamp is reliable or manageable. 
        // User didn't ask to change Calls logic specifically, but for consistency we can apply similar date logic if it's also text.
        // Let's stick to DB query for Calls as it wasn't the focus of the fix, to reduce risk.
        let callsQuery = supabase.from("leads_tracker").select("*", { count: "exact", head: true });
        if (filters.scName !== "all") callsQuery = callsQuery.eq("SC_Name", filters.scName);
        if (filters.startDate) callsQuery = callsQuery.gte("Timestamp", filters.startDate);
        if (filters.endDate) callsQuery = callsQuery.lte("Timestamp", filters.endDate);
        
        const { count: callsCount, error: callsError } = await callsQuery;
        if (callsError) console.error("Error fetching calls:", callsError);


        // 2, 3, 4 & 5. Fetch Total Leads, Enquiries, Quotations & Orders (leads_to_order)
        // Fetch all potential rows to filter client-side due to format issues
        // Updated to include "Timestamp" for Total Leads count
        let leadsQuery = supabase
            .from("leads_to_order")
            .select("Planned1, Actual1, SC_Name, Quotation_Number, Timestamp")
            // Removed .not("Planned1", "is", null) constraint because Total Leads relies on Timestamp, which might exist even if Planned1 is null
        
        // If SC Name is selected, we CAN filter that in DB to reduce data
        if (filters.scName !== "all") {
            leadsQuery = leadsQuery.eq("SC_Name", filters.scName);
        }

        const { data: leadsData, error: leadsError } = await leadsQuery;
        
        let totalLeadCount = 0;
        let enquiryCount = 0;
        let orderCount = 0;
        let quotationCount = 0;

        if (leadsError) {
             console.error("Error fetching leads_to_order:", leadsError);
        } else if (leadsData) {
            leadsData.forEach(row => {
                const pDate = parseDate(row.Planned1);
                const aDate = row.Actual1 ? parseDate(row.Actual1) : null;
                const tDate = parseDate(row.Timestamp); // Parse Timestamp for Total Leads

                // Total Leads: Count all leads, filter by Timestamp
                if (tDate) { 
                     if (isDateInRange(tDate, filters.startDate, filters.endDate)) {
                        totalLeadCount++;
                    }
                }

                // Enquiries: Planned1 != null
                // Filter Match: Planned1
                if (row.Planned1) {
                    if (isDateInRange(pDate, filters.startDate, filters.endDate)) {
                        enquiryCount++;
                    }
                }

                // Orders: Planned1 != null (handled), Actual1 != null
                // Filter Match: Actual1
                if (row.Planned1 && row.Actual1) {
                    if (isDateInRange(aDate, filters.startDate, filters.endDate)) {
                        orderCount++;
                    }
                }

                // Quotations: Planned1 != null (handled), Quotation_Number != null
                // Filter Match: Planned1
                if (row.Planned1 && row.Quotation_Number) {
                     if (isDateInRange(pDate, filters.startDate, filters.endDate)) {
                        quotationCount++;
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
        });

    } catch (error) {
      console.error("Error fetching report metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, isAdmin]);

  useEffect(() => {
    fetchSCNames();
  }, [fetchSCNames]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
        </div>
      </div>
    </div>
  );
}

export default Report;
