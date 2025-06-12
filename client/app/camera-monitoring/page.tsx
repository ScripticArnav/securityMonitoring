"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Play, Square, RefreshCw } from "lucide-react"

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

interface LogsResponse {
  detection_logs: DetectionLog[]
  notification_logs: NotificationLog[]
}

export default function CameraMonitoringPage() {
  const [isDetectionActive, setIsDetectionActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [detectionLogs, setDetectionLogs] = useState<DetectionLog[]>([])
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([])
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraUrl, setCameraUrl] = useState<string>("")
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Set the Flask server URL
  const FLASK_SERVER_URL = "http://localhost:5000"

  useEffect(() => {
    // Set the camera URL when component mounts
    setCameraUrl(`${FLASK_SERVER_URL}/video_feed?t=${new Date().getTime()}`)

    // Clean up interval on component unmount
    return () => {
      stopLogUpdates()
    }
  }, [])

  // Function to start detection
  const startDetection = async () => {
    setIsLoading(true)
    setCameraError(null)

    try {
      console.log("Sending start detection request to:", `${FLASK_SERVER_URL}/start_detection`)

      const response = await fetch(`${FLASK_SERVER_URL}/start_detection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Start detection response:", data)

      if (data.status === "success") {
        setIsDetectionActive(true)
        // Refresh the camera feed with a new timestamp to avoid caching
        setCameraUrl(`${FLASK_SERVER_URL}/video_feed?t=${new Date().getTime()}`)

        toast.success("Detection Started", {
          description: "Face and vehicle detection is now active",
        })

        // Start fetching logs periodically
        startLogUpdates()
      } else {
        toast.info(data.message || "Detection already running")
      }
    } catch (error) {
      console.error("Error starting detection:", error)
      setCameraError(`Failed to connect to camera server: ${error instanceof Error ? error.message : String(error)}`)
      toast.error("Failed to start detection", {
        description: "Make sure the Python server is running and accessible.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to stop detection
  const stopDetection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${FLASK_SERVER_URL}/stop_detection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        setIsDetectionActive(false)
        toast.success("Detection Stopped", {
          description: "Face and vehicle detection has been stopped",
        })

        // Stop fetching logs
        stopLogUpdates()
      } else {
        toast.info(data.message || "Detection not running")
      }
    } catch (error) {
      console.error("Error stopping detection:", error)
      toast.error("Failed to stop detection", {
        description: "Connection to the server failed.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to fetch logs
  const fetchLogs = async () => {
    try {
      const response = await fetch(`${FLASK_SERVER_URL}/get_logs`)

      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data: LogsResponse = await response.json()
      setDetectionLogs(data.detection_logs)
      setNotificationLogs(data.notification_logs)
    } catch (error) {
      console.error("Error fetching logs:", error)
    }
  }

  // Start fetching logs periodically
  const startLogUpdates = () => {
    // Fetch logs immediately
    fetchLogs()

    // Then fetch every 5 seconds
    logIntervalRef.current = setInterval(fetchLogs, 5000)
  }

  // Stop fetching logs
  const stopLogUpdates = () => {
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current)
      logIntervalRef.current = null
    }
  }

  // Handle image loading error
  const handleImageError = () => {
    setCameraError("Failed to connect to camera feed. Make sure the Flask server is running.")
    if (imgRef.current) {
      // Try to reload the image after a delay
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = `${FLASK_SERVER_URL}/video_feed?t=${new Date().getTime()}`
        }
      }, 5000)
    }
  }

  // Handle image load success
  const handleImageLoad = () => {
    setCameraError(null)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Camera Monitoring</h1>
        <p className="text-muted-foreground">Live face recognition and vehicle detection</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Live Camera Feed</CardTitle>
              <CardDescription>Real-time video with face and vehicle detection</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden rounded-b-lg">
              <div className="relative aspect-video bg-muted">
                {cameraError ? (
                  <div className="absolute inset-0 flex items-center justify-center flex-col p-6 text-center">
                    <p className="text-destructive mb-4">{cameraError}</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCameraUrl(`${FLASK_SERVER_URL}/video_feed?t=${new Date().getTime()}`)
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Connection
                    </Button>
                  </div>
                ) : null}

                {/* Video feed from Flask server */}
                <img
                  ref={imgRef}
                  src={cameraUrl || "/placeholder.svg"}
                  alt="Camera Feed"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  style={{ opacity: cameraError ? 0.3 : 1 }}
                />

                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <Badge variant={isDetectionActive ? "success" : "secondary"} className="px-3 py-1 text-sm">
                    {isDetectionActive ? "Detection Active" : "Detection Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 mt-4">
            <Button size="lg" onClick={startDetection} disabled={isDetectionActive || isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Detection
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={stopDetection}
              disabled={!isDetectionActive || isLoading}
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
              Stop Detection
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detection Logs</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchLogs} className="h-8 w-8 p-0">
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {detectionLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No detection logs available</p>
                ) : (
                  detectionLogs.slice(0, 5).map((log) => (
                    <div
                      key={log._id}
                      className={`p-3 rounded-md text-sm ${
                        log.authenticated
                          ? "bg-green-50 border-l-4 border-green-500 dark:bg-green-950/20 dark:border-green-800"
                          : "bg-red-50 border-l-4 border-red-500 dark:bg-red-950/20 dark:border-red-800"
                      }`}
                    >
                      <div className="font-medium">
                        {log.name || "Unknown"} {log.authenticated ? "(Authorized)" : "(Unauthorized)"}
                      </div>
                      <div className="text-xs text-muted-foreground">{log.timestamp}</div>
                      {log.plateNumber && (
                        <div className="mt-1 text-xs">
                          <span className="font-medium">Plate:</span> {log.plateNumber}
                        </div>
                      )}
                      {log.objectDetected && log.objectDetected.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {log.objectDetected.map((obj, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {obj}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {notificationLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No alerts available</p>
                ) : (
                  notificationLogs.slice(0, 5).map((log) => (
                    <div
                      key={log._id}
                      className="p-3 bg-red-50 border-l-4 border-red-500 rounded-md text-sm dark:bg-red-950/20 dark:border-red-800"
                    >
                      <div className="font-medium">Alert: {log.reason}</div>
                      <div className="text-xs text-muted-foreground">{log.timestamp}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {log.details.face && (
                          <Badge variant="outline" className="text-xs">
                            Unknown Face
                          </Badge>
                        )}
                        {log.details.plate && (
                          <Badge variant="outline" className="text-xs">
                            License Plate
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Face Recognition</span>
                  <Badge variant={isDetectionActive ? "success" : "secondary"}>
                    {isDetectionActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Vehicle Detection</span>
                  <Badge variant={isDetectionActive ? "success" : "secondary"}>
                    {isDetectionActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">License Plate Recognition</span>
                  <Badge variant={isDetectionActive ? "success" : "secondary"}>
                    {isDetectionActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Server Connection</span>
                  <Badge variant={cameraError ? "destructive" : "success"}>
                    {cameraError ? "Disconnected" : "Connected"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
