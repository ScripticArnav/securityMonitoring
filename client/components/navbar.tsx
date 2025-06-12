"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"

const routes = [
  {
    name: "Dashboard",
    path: "/",
  },
  {
    name: "Camera Monitoring",
    path: "/camera-monitoring",
  },
  {
    name: "Register User",
    path: "/register-user",
  },
  {
    name: "User List",
    path: "/user-list",
  },
  {
    name: "Detection Logs",
    path: "/detection-logs",
  },
  {
    name: "Notification Logs",
    path: "/notification-logs",
  },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800">
      <div className="text-center py-2 text-white font-semibold">
        <span className="text-4xl">Institute of Engineering & Technology, Lucknow</span>
        <br />
        <p className="mt-2 text-lg">Electronics & Communication Engineering</p>
      </div>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-md">
        <div className="ml-5 container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl text-blue-900">Security Monitor</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={cn(
                    "transition-colors hover:text-blue-700",
                    pathname === route.path ? "text-blue-900 font-bold" : "text-gray-600",
                  )}
                >
                  {route.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-between md:justify-end">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" className="mr-2 border-blue-900 text-blue-900 hover:bg-blue-50">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                  <span className="font-bold text-xl text-blue-900">Security Monitor</span>
                </Link>
                <nav className="mt-8 flex flex-col gap-4">
                  {routes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "text-gray-600 transition-colors hover:text-blue-700",
                        pathname === route.path && "text-blue-900 font-medium",
                      )}
                    >
                      {route.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="hidden md:flex">
              {/* <Link href="/" className="flex items-center">
                <span className="font-medium text-blue-900">Smart Security System</span>
              </Link> */}
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
