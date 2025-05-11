"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Download, FileText, Plus, RefreshCw, Search, Trash2, Edit } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const apiService = {
  reports: {
    getAll: async () => {
      const response = await fetch("/api/Report/GetAll")
      if (!response.ok) throw new Error("Failed to fetch reports")
      return response.json()
    },
    getById: async (id) => {
      const response = await fetch(`/api/Report/GetById/${id}`)
      if (!response.ok) throw new Error("Failed to fetch report")
      return response.json()
    },
    getByUserId: async (userId) => {
      const response = await fetch(`/api/Report/GetByUserId/${userId}`)
      if (!response.ok) throw new Error("Failed to fetch user reports")
      return response.json()
    },
    add: async (reportData) => {
      const response = await fetch("/api/Report/Add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      })
      if (!response.ok) throw new Error("Failed to add report")
      return response.json()
    },
    update: async (id, reportData) => {
      const response = await fetch(`/api/Report/Update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      })
      if (!response.ok) throw new Error("Failed to update report")
      return response.json()
    },
    delete: async (id) => {
      const response = await fetch(`/api/Report/Delete/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete report")
      return response.json()
    },
  },
}

export default function ReportsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    desctiption: "", // Note: Using 'desctiption' to match backend
    from: new Date(),
    to: new Date(),
    userId: "",
  })

  useEffect(() => {
    const userId = localStorage.getItem("userId") || ""
    setFormData((prev) => ({ ...prev, userId }))
    fetchReports(userId)
  }, [])

  const fetchReports = async (userId) => {
    try {
      setLoading(true)
      const data = await apiService.reports.getByUserId(userId)
      
      const reportsWithDates = data.map(report => ({
        ...report,
        from: new Date(report.from),
        to: new Date(report.to)
      }))
      
      setReports(Array.isArray(reportsWithDates) ? reportsWithDates : [])
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to load reports. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddReport = async () => {
    try {
      if (!formData.desctiption || !formData.from || !formData.to || !formData.userId) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      if (new Date(formData.to) < new Date(formData.from)) {
        toast({
          title: "Date Error",
          description: "End date cannot be before start date.",
          variant: "destructive",
        })
        return
      }

      const payload = {
        desctiption: formData.desctiption,
        from: formData.from.toISOString(),
        to: formData.to.toISOString(),
        userId: formData.userId
      }

      await apiService.reports.add(payload)
      toast({
        title: "Success",
        description: "Report created successfully!",
      })

      setFormData({
        desctiption: "",
        from: new Date(),
        to: new Date(),
        userId: formData.userId,
      })
      setIsAddDialogOpen(false)
      fetchReports(formData.userId)
    } catch (error) {
      console.error("Error adding report:", error)
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateReport = async () => {
    try {
      if (!selectedReport || !formData.desctiption || !formData.from || !formData.to) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      if (new Date(formData.to) < new Date(formData.from)) {
        toast({
          title: "Date Error",
          description: "End date cannot be before start date.",
          variant: "destructive",
        })
        return
      }

      const payload = {
        desctiption: formData.desctiption,
        from: formData.from.toISOString(),
        to: formData.to.toISOString(),
        userId: formData.userId
      }

      await apiService.reports.update(selectedReport.id, payload)
      toast({
        title: "Success",
        description: "Report updated successfully!",
      })

      setIsEditDialogOpen(false)
      fetchReports(formData.userId)
    } catch (error) {
      console.error("Error updating report:", error)
      toast({
        title: "Error",
        description: "Failed to update report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReport = async (id) => {
    try {
      await apiService.reports.delete(id)
      toast({
        title: "Success",
        description: "Report deleted successfully!",
      })
      fetchReports(formData.userId)
    } catch (error) {
      console.error("Error deleting report:", error)
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewReport = async (report) => {
    setSelectedReport(report)
    setIsViewDialogOpen(true)
  }

  const handleEditReport = (report) => {
    setSelectedReport(report)
    setFormData({
      desctiption: report.desctiption || "",
      from: new Date(report.from),
      to: new Date(report.to),
      userId: report.userId,
    })
    setIsEditDialogOpen(true)
  }

  const filteredReports = reports.filter((report) =>
    report.desctiption?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDateISO = (date) => {
    try {
      return new Date(date).toISOString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const exportReportsToCsv = () => {
    if (reports.length === 0) {
      toast({
        title: "Export Failed",
        description: "No reports to export.",
        variant: "destructive",
      })
      return
    }

    const headers = ["ID", "Description", "From", "To", "Total Income", "Total Expense", "Net Balance"]
    const csvContent = [
      headers.join(","),
      ...filteredReports.map((report) =>
        [
          report.id,
          `"${report.desctiption?.replace(/"/g, '""') || ""}"`,
          formatDateISO(report.from),
          formatDateISO(report.to),
          report.totalIncome,
          report.totalExpense,
          (report.totalIncome - report.totalExpense).toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `reports_${new Date().toISOString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">Manage and analyze your financial reports</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => fetchReports(formData.userId)} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={exportReportsToCsv} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Report</DialogTitle>
                  <DialogDescription>Create a new financial report for a specific time period.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter report description"
                      value={formData.desctiption}
                      onChange={(e) => setFormData({ ...formData, desctiption: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="from">From Date</Label>
                      <DatePicker
                        id="from"
                        date={formData.from}
                        setDate={(date) => setFormData({ ...formData, from: date })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="to">To Date</Label>
                      <DatePicker
                        id="to"
                        date={formData.to}
                        setDate={(date) => setFormData({ ...formData, to: date })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddReport}>Create Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No reports found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term or" : "Get started by"} creating a new report.
              </p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium truncate">
                    {report.desctiption || "Untitled Report"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateISO(report.from)} - {formatDateISO(report.to)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Income</p>
                      <p className="text-lg font-medium text-green-500">${report.totalIncome?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expenses</p>
                      <p className="text-lg font-medium text-red-500">${report.totalExpense?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Net Balance</p>
                    <p
                      className={`text-lg font-medium ${
                        report.totalIncome - report.totalExpense >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      ${(report.totalIncome - report.totalExpense)?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)}>
                    View Details
                  </Button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditReport(report)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Report</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this report? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReport(report.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{selectedReport.desctiption || "Untitled Report"}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateISO(selectedReport.from)} - {formatDateISO(selectedReport.to)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-500">
                        ${selectedReport.totalIncome?.toFixed(2) || "0.00"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-500">
                        ${selectedReport.totalExpense?.toFixed(2) || "0.00"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Net Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`text-2xl font-bold ${
                        selectedReport.totalIncome - selectedReport.totalExpense >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      ${(selectedReport.totalIncome - selectedReport.totalExpense)?.toFixed(2) || "0.00"}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEditReport(selectedReport);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Report</DialogTitle>
              <DialogDescription>Update the details of your financial report.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter report description"
                  value={formData.desctiption}
                  onChange={(e) => setFormData({ ...formData, desctiption: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-from">From Date</Label>
                  <DatePicker
                    id="edit-from"
                    date={formData.from}
                    setDate={(date) => setFormData({ ...formData, from: date })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-to">To Date</Label>
                  <DatePicker
                    id="edit-to"
                    date={formData.to}
                    setDate={(date) => setFormData({ ...formData, to: date })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateReport}>Update Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}