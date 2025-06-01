"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DetectionLog {
  _id: string
  timestamp: string
  personDetected: boolean
  plateDetected: boolean
  name: string | null
  rollNo: string | null
  plateNumber: string | null
  image: string | null
  objectDetected: string[]
  authenticated: boolean
}

export default function DetectionLogsPage() {
  const [logs, setLogs] = useState<DetectionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/detections")
      if (!response.ok) {
        throw new Error("Failed to fetch detection logs")
      }
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error("Error fetching detection logs:", error)
      toast.error("Failed to load detection logs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    // Filter by search term
    const searchMatch =
      (log.name && log.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.rollNo && log.rollNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.plateNumber && log.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.objectDetected && log.objectDetected.some((obj) => obj.toLowerCase().includes(searchTerm.toLowerCase())))

    // Filter by authentication status
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "authorized" && log.authenticated) ||
      (filterStatus === "unauthorized" && !log.authenticated)

    return searchMatch && statusMatch
  })

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLogs.map((log) => ({
        "Date & Time": new Date(log.timestamp).toLocaleString(),
        Person: log.name || "Unknown",
        "Roll Number": log.rollNo || "N/A",
        "Plate Number": log.plateNumber || "N/A",
        Status: log.authenticated ? "Authorized" : "Unauthorized",
        "Objects Detected": log.objectDetected.join(", ") || "None",
      })),
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detection Logs")
    XLSX.writeFile(workbook, "detection_logs.xlsx")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Detection Logs</CardTitle>
              <CardDescription>View all security detection events</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="authorized">Authorized</SelectItem>
                  <SelectItem value="unauthorized">Unauthorized</SelectItem>
                </SelectContent>
              </Select>
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
                    <TableHead>Detection</TableHead>
                    <TableHead>Person</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Objects</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No detection logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {log.personDetected && (
                              <Badge variant="outline" className="w-fit">
                                Person
                              </Badge>
                            )}
                            {log.plateDetected && (
                              <Badge variant="outline" className="w-fit">
                                Vehicle
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.personDetected && (
                            <div className="flex items-center gap-2">
                              {log.image ? (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={`data:image/jpeg;base64,${log.image}`} alt="Person" />
                                  <AvatarFallback>{log.name ? log.name.charAt(0) : "?"}</AvatarFallback>
                                </Avatar>
                              ) : null}
                              <div>
                                <div>{log.name || "Unknown"}</div>
                                {log.rollNo && <div className="text-xs text-muted-foreground">{log.rollNo}</div>}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{log.plateNumber ? log.plateNumber : "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {log.objectDetected && log.objectDetected.length > 0 ? (
                              log.objectDetected.map((obj, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {obj}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.authenticated ? "success" : "destructive"} className="capitalize">
                            {log.authenticated ? "Authorized" : "Unauthorized"}
                          </Badge>
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
