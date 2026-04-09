import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <main className="max-w-[1080px] px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
