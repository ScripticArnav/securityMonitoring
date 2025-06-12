"use client"
import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2, Upload } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  rollNo: z.string().min(1, {
    message: "Roll number is required.",
  }),
  branch: z.string().min(1, {
    message: "Branch is required.",
  }),
  hasVehicle: z.boolean().default(false),
  plateNumber: z.string().optional(),
  vehicleType: z.string().optional(),
  images: z.any().refine((files) => files?.length > 0, {
    message: "At least one image is required.",
  }),
})

export default function RegisterUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rollNo: "",
      branch: "",
      hasVehicle: false,
      plateNumber: "",
      vehicleType: "",
      images: undefined,
    },
  })

  const hasVehicle = form.watch("hasVehicle")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    form.setValue("images", files)

    // Create preview URLs
    const newPreviewUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      newPreviewUrls.push(URL.createObjectURL(files[i]))
    }
    setPreviewUrls(newPreviewUrls)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("rollNo", values.rollNo)
      formData.append("branch", values.branch)

      // Add vehicle information
      const vehicleData = {
        hasVehicle: values.hasVehicle,
        plateNumber: values.hasVehicle ? values.plateNumber : null,
        type: values.hasVehicle ? values.vehicleType : null,
      }
      formData.append("vehicle", JSON.stringify(vehicleData))

      // Add images
      const files = values.images
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i])
      }

      const response = await fetch("/api/users/register", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to register user")
      }

      const data = await response.json()

      toast.success("User registered successfully")

      // Reset form
      form.reset()
      setPreviewUrls([])
    } catch (error) {
      console.error("Error registering user:", error)
      toast.error("Failed to register user. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Register New User</CardTitle>
          <CardDescription>Add a new user to the security monitoring system</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rollNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CSE">Computer Science</SelectItem>
                          <SelectItem value="ECE">Electronics</SelectItem>
                          <SelectItem value="ME">Mechanical</SelectItem>
                          <SelectItem value="CE">Civil</SelectItem>
                          <SelectItem value="EE">Electrical</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hasVehicle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Has Vehicle</FormLabel>
                      <FormDescription>Check if the user has a vehicle</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {hasVehicle && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bike">Bike</SelectItem>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="images"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Face Images</FormLabel>
                    <FormControl>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                            </div>
                            <Input
                              id="image-upload"
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                              {...rest}
                            />
                          </label>
                        </div>

                        {previewUrls.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {previewUrls.map((url, index) => (
                              <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                                <img
                                  src={url || "/placeholder.svg"}
                                  alt={`Preview ${index + 1}`}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload clear face images for recognition. Multiple images improve accuracy.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register User"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
