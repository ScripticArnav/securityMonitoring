"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Loader2, Search, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface NotificationLog {
  _id: string
  timestamp: string
  reason: string
  image: string | null
  details: {
    face: boolean
    plate: boolean
    matched: boolean
  }
}

export default function NotificationLogsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (!response.ok) {
        throw new Error("Failed to fetch notification logs")
      }
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error("Error fetching notification logs:", error)
      toast.error("Failed to load notification logs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => log.reason.toLowerCase().includes(searchTerm.toLowerCase()))

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLogs.map((log) => ({
        "Date & Time": new Date(log.timestamp).toLocaleString(),
        Reason: log.reason,
        "Face Detection": log.details.face ? "Yes" : "No",
        "Plate Detection": log.details.plate ? "Yes" : "No",
        Matched: log.details.matched ? "Yes" : "No",
      })),
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notification Logs")
    XLSX.writeFile(workbook, 'notification  worksheet, "Notification Logs')
    XLSX.writeFile(workbook, "notification_logs.xlsx")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Notification Logs</CardTitle>
              <CardDescription>View all security alerts and notifications</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notifications..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={exportToExcel} className="gap-2">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No notification logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <Badge variant="destructive">Security Alert</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{log.reason}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {log.details.face && (
                              <Badge variant="outline" className="w-fit">
                                Unknown Face
                              </Badge>
                            )}
                            {log.details.plate && (
                              <Badge variant="outline" className="w-fit">
                                License Plate
                              </Badge>
                            )}
                            {log.details.matched && (
                              <Badge variant="outline" className="w-fit">
                                Matched
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
