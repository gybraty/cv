import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { apiService } from "@/_services/apiService"
import { logoutUser } from "@/_actions/authActions"
import type { AppDispatch, RootState } from "@/store"

export default function DashboardPage() {
  const [message, setMessage] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate("/login")
  }

  const fetchPrivateMessage = async () => {
    try {
      setError(null)
      const data = await apiService.getPrivateMessage()
      setMessage(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      
      <div className="flex gap-4">
        <Button onClick={fetchPrivateMessage}>Get Private Message</Button>
        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
      </div>

      {message && (
        <pre className="p-4 bg-gray-100 rounded-md mt-4">
          {JSON.stringify(message, null, 2)}
        </pre>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}
