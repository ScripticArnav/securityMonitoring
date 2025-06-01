import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Forward the request to the backend API
    const backendResponse = await fetch("http://localhost:3001/api/users/register", {
      method: "POST",
      body: formData,
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { error: errorData.error || "Failed to register user" },
        { status: backendResponse.status },
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in register route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
