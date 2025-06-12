"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface User {
  _id: string;
  name: string;
  rollNo: string;
  branch: string;
  images: {
    name: string;
    data: string;
    contentType: string;
  }[];
  vehicle: {
    hasVehicle: boolean;
    plateNumber: string | null;
    type: string | null;
  };
  createdAt: string;
}

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.vehicle.plateNumber &&
        user.vehicle.plateNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredUsers.map((user) => ({
        Name: user.name,
        "Roll Number": user.rollNo,
        Branch: user.branch,
        "Has Vehicle": user.vehicle.hasVehicle ? "Yes" : "No",
        "Plate Number": user.vehicle.plateNumber || "N/A",
        "Vehicle Type": user.vehicle.type || "N/A",
        "Registration Date": new Date(user.createdAt).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_list.xlsx");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>User List</CardTitle>
              <CardDescription>
                Manage registered users in the system
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
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
                    <TableHead>User</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {user.images && user.images.length > 0 ? (
                                <AvatarImage
                                  src={`data:${user.images[0].contentType};base64,${user.images[0].data}`}
                                  alt={user.name}
                                />
                              ) : null}
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.images?.length || 0} images
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.rollNo}</TableCell>
                        <TableCell>{user.branch}</TableCell>
                        <TableCell>
                          {user.vehicle?.hasVehicle ? (
                            <div className="space-y-1">
                              <Badge variant="outline">
                                {user.vehicle.type || "Vehicle"}
                              </Badge>
                              <div className="text-sm">
                                {user.vehicle.plateNumber}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No vehicle
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
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
  );
}
