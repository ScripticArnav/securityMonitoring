import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Users, Bell, FileText, Shield, Camera, Car, UserCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Security Monitoring System</h1>
        <p className="text-muted-foreground">Face recognition and vehicle detection for enhanced security</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Camera Monitoring</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live Detection</div>
            <p className="text-xs text-muted-foreground">Real-time face and vehicle recognition</p>
            <Button asChild className="w-full mt-4">
              <Link href="/camera-monitoring">Open Camera</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Register User</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">User Registration</div>
            <p className="text-xs text-muted-foreground">Add new users with face recognition</p>
            <Button asChild className="w-full mt-4">
              <Link href="/register-user">Register New User</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User List</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Users</div>
            <p className="text-xs text-muted-foreground">View and manage registered users</p>
            <Button asChild className="w-full mt-4">
              <Link href="/user-list">View Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Security Events</div>
            <p className="text-xs text-muted-foreground">View all detection events and activities</p>
            <Button asChild className="w-full mt-4">
              <Link href="/detection-logs">View Logs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Security Alerts</div>
            <p className="text-xs text-muted-foreground">View security notifications and alerts</p>
            <Button asChild className="w-full mt-4">
              <Link href="/notification-logs">View Notifications</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>System Features</CardTitle>
            <CardDescription>Key capabilities of the security monitoring system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Advanced Security Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <span>Face Recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <span>Vehicle Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <span>User Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Real-time Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Comprehensive Logging</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
