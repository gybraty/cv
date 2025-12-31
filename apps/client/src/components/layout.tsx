import { Outlet, useLocation } from "react-router-dom"
import { Navbar } from "./navbar"

export function Layout() {
  const location = useLocation();
  const isEditorPage = location.pathname.includes("/edit");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />
      <main className={`flex-1 ${!isEditorPage ? "w-[80%] mx-auto" : ""}`}>
        <Outlet />
      </main>
    </div>
  )
}
