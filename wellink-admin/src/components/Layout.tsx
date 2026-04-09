import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <main className="w-full px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
