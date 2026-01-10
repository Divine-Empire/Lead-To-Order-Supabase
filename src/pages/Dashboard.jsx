import { useState, useEffect, useContext, useCallback } from "react"
import { AuthContext } from "../App"
import supabase from "../utils/supabase"
import DashboardMetrics from "../components/dashboard/DashboardMetrics"
import DashboardCharts from "../components/dashboard/DashboardCharts"
import PendingTasks from "../components/dashboard/PendingTasks"
import RecentActivities from "../components/dashboard/RecentActivities"

function Dashboard() {
  const { currentUser, userType, isAdmin } = useContext(AuthContext)
  
  // Filter States
  const [scNameFilter, setScNameFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [uniqueScNames, setUniqueScNames] = useState([])

  // Fetch unique SC names for admin filter
  const fetchUniqueScNames = useCallback(async () => {
    if (!isAdmin()) return

    try {
      const { data, error } = await supabase
        .from("leads_to_order")
        .select("SC_Name")
        .not("SC_Name", "is", null)
        .not("SC_Name", "eq", "")
      
      if (error) throw error
      
      if (data) {
        const uniqueNames = [...new Set(data.map(item => item.SC_Name))].sort()
        setUniqueScNames(uniqueNames)
      }
    } catch (err) {
      console.error("Error fetching SC names:", err)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchUniqueScNames()
  }, [fetchUniqueScNames])

  // Handlers
  const handleScChange = (e) => {
    setScNameFilter(e.target.value)
  }

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value)
  }

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value)
  }

  const handleResetFilters = () => {
    setScNameFilter("all")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Leads To Order System
            </h1>
            <p className="text-slate-600 mt-2">Monitor your sales pipeline and track conversions in real-time</p>
          </div>

          {/* Global Filters Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-end border border-slate-200">
              {/* Admin SC Filter */}
              {isAdmin() && (
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 mb-1">SC Name</label>
                  <select
                    value={scNameFilter}
                    onChange={handleScChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 min-w-[150px]"
                  >
                    <option value="all">All SCs</option>
                    {uniqueScNames.map((name, index) => (
                      <option key={index} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Date Range Filters */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              
              {/* Reset Button */}
              <button 
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Reset
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <DashboardMetrics 
            scNameFilter={scNameFilter}
            startDate={startDate}
            endDate={endDate}
          />

          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <DashboardCharts 
                scNameFilter={scNameFilter}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>

          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <PendingTasks />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <RecentActivities />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
