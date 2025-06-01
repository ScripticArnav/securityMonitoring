import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the backend API
    const backendResponse = await fetch("http://localhost:3001/api/detections", {
      method: "GET",
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch detection logs" },
        { status: backendResponse.status },
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in detections route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
