"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../App" // Import AuthContext
import supabase from "../../utils/supabase" // Import your Supabase client
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Fallback data in case of errors
const fallbackLeadData = [
  { month: "Jan", leads: 45, enquiries: 30, orders: 12 },
  { month: "Feb", leads: 52, enquiries: 35, orders: 15 },
  { month: "Mar", leads: 48, enquiries: 32, orders: 14 },
  { month: "Apr", leads: 70, enquiries: 45, orders: 20 },
  { month: "May", leads: 65, enquiries: 40, orders: 18 },
  { month: "Jun", leads: 58, enquiries: 38, orders: 16 },
]

const fallbackConversionData = [
  { name: "Leads", value: 124, color: "#4f46e5" },
  { name: "Enquiries", value: 82, color: "#8b5cf6" },
  { name: "Quotations", value: 56, color: "#d946ef" },
  { name: "Orders", value: 27, color: "#ec4899" },
]

const fallbackSourceData = [
  { name: "Indiamart", value: 45, color: "#06b6d4" },
  { name: "Justdial", value: 28, color: "#0ea5e9" },
  { name: "Social Media", value: 20, color: "#3b82f6" },
  { name: "Website", value: 15, color: "#6366f1" },
  { name: "Referrals", value: 12, color: "#8b5cf6" },
]

function DashboardCharts() {
  const { currentUser, userType, isAdmin } = useContext(AuthContext) // Get user info and admin function
  const [activeTab, setActiveTab] = useState("overview")
  const [leadData, setLeadData] = useState(fallbackLeadData)
  const [conversionData, setConversionData] = useState(fallbackConversionData)
  const [sourceData, setSourceData] = useState(fallbackSourceData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch counts for conversion funnel
        let totalLeads = 0
        let totalEnquiries = 0
        let totalQuotations = 0
        let totalOrders = 0
        
        // Get total leads count
        let leadsCountQuery = supabase
          .from('leads_to_order')
          .select('*', { count: 'exact', head: true })
        
        // Apply user filter if not admin - use SC_Name field
        if (!isAdmin() && currentUser?.username) {
          leadsCountQuery = leadsCountQuery.eq('SC_Name', currentUser.username)
        }
        
        const { count: leadsCount, error: leadsCountError } = await leadsCountQuery
        if (!leadsCountError) {
          totalLeads = leadsCount || 0
        }
        
        // Get total enquiries count (where Enquiry_Received_Status = "yes")
        let enquiriesCountQuery = supabase
          .from('leads_tracker')
          .select('*', { count: 'exact', head: true })
          .eq('Enquiry_Received_Status', 'yes')
        
        // Apply user filter if not admin - use SC_Name field
        if (!isAdmin() && currentUser?.username) {
          enquiriesCountQuery = enquiriesCountQuery.eq('SC_Name', currentUser.username)
        }
        
        const { count: enquiriesCount, error: enquiriesCountError } = await enquiriesCountQuery
        if (!enquiriesCountError) {
          totalEnquiries = enquiriesCount || 0
        }
        
        // Get total quotations count (rows with Quotation Number not null)
        const { count: quotationsCount, error: quotationsCountError } = await supabase
          .from('enquiry_tracker')
          .select('*', { count: 'exact', head: true })
          .not('Quotation Number', 'is', null)
          .neq('Quotation Number', '')
        
        if (!quotationsCountError) {
          totalQuotations = quotationsCount || 0
        }
        
        // Get total orders count (where "Is Order Received? Status" = "yes")
        const { count: ordersCount, error: ordersCountError } = await supabase
          .from('enquiry_tracker')
          .select('*', { count: 'exact', head: true })
          .eq('"Is Order Received? Status"', 'yes')
        
        if (!ordersCountError) {
          totalOrders = ordersCount || 0
        }
        
        // Create conversion data
        const newConversionData = [
          { name: "Leads", value: totalLeads, color: "#4f46e5" },
          { name: "Enquiries", value: totalEnquiries, color: "#8b5cf6" },
          { name: "Quotations", value: totalQuotations, color: "#d946ef" },
          { name: "Orders", value: totalOrders, color: "#ec4899" }
        ]
        
        setConversionData(newConversionData)
        
        // For lead sources, we need to fetch the Lead_Source field to count by source
        let leadSourcesQuery = supabase
          .from('leads_to_order')
          .select('Lead_Source')
        
        // Apply user filter if not admin
        if (!isAdmin() && currentUser?.username) {
          leadSourcesQuery = leadSourcesQuery.eq('SC_Name', currentUser.username)
        }
        
        const { data: leadSourcesData, error: leadSourcesError } = await leadSourcesQuery
        
        if (!leadSourcesError && leadSourcesData) {
          // Count leads by source
          const sourceCounter = {}
          
          // Define a color palette
          const colorPalette = [
            "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", 
            "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#ef4444", 
            "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", 
            "#10b981", "#14b8a6",
          ]
          
          leadSourcesData.forEach(row => {
            if (row.Lead_Source) {
              const source = row.Lead_Source
              sourceCounter[source] = (sourceCounter[source] || 0) + 1
            }
          })
          
          // Convert to array format for the chart
          const sourceNames = Object.keys(sourceCounter)
          const newSourceData = sourceNames.map((name, index) => ({
            name,
            value: sourceCounter[name],
            color: colorPalette[index % colorPalette.length]
          }))
          
          // Sort by value (descending)
          newSourceData.sort((a, b) => b.value - a.value)
          
          if (newSourceData.length > 0) {
            setSourceData(newSourceData)
          }
        }
        
        // For monthly data, we'll use a simplified approach with current counts
        // Since we're optimizing for performance, we'll keep it simple for now
        const currentMonth = new Date().toLocaleString('en-US', { month: 'short' })
        const simplifiedMonthlyData = [{
          month: currentMonth,
          leads: totalLeads,
          enquiries: totalEnquiries,
          orders: totalOrders
        }]
        
        setLeadData(simplifiedMonthlyData)
        
        console.log('Chart data calculated for user:', currentUser?.username, {
          totalLeads,
          totalEnquiries,
          totalQuotations,
          totalOrders
        })
        
      } catch (error) {
        console.error("Error fetching chart data:", error)
        setError(error.message)
        // Fallback to demo data is already handled since we initialized state with it
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [currentUser, isAdmin]) // Add dependencies for user context

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Sales Analytics ( Lead To Order )</h3>
        {/* Display admin view indicator similar to FollowUp page */}
        {isAdmin() && <p className="text-green-600 font-semibold">Admin View: Showing all data</p>}
      </div>

      <div className="mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              activeTab === "overview" ? "bg-slate-100 text-slate-900" : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("conversion")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "conversion" ? "bg-slate-100 text-slate-900" : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Conversion
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              activeTab === "sources" ? "bg-slate-100 text-slate-900" : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Lead Sources
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[350px] flex items-center justify-center">
          <p className="text-slate-500">Loading chart data...</p>
        </div>
      ) : error ? (
        <div className="h-[350px] flex items-center justify-center">
          <p className="text-red-500">Error loading data. Using fallback data.</p>
        </div>
      ) : (
        <div className="h-[350px]">
          {activeTab === "overview" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Leads" fill="#4f46e5" />
                <Bar dataKey="enquiries" name="Enquiries" fill="#8b5cf6" />
                <Bar dataKey="orders" name="Orders" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeTab === "conversion" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div className="h-full w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center overflow-y-auto max-h-[350px]">
                <h4 className="text-lg font-medium mb-4">Conversion Funnel</h4>
                <div className="space-y-4">
                  {conversionData.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${(item.value / (conversionData[0].value || 1)) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sources" && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardCharts