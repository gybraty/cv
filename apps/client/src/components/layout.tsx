import { Outlet } from "react-router-dom"
import { Navbar } from "./dashboard/navbar"

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
