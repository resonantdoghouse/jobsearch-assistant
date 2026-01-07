import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form
          action={async () => {
            "use server"
            await signOut()
          }}
        >
          <button className="text-sm text-gray-600 hover:text-red-500 font-medium px-4 py-2 rounded transition-colors">
            Sign Out
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[300px]">
        <div className="flex items-center gap-4 mb-6">
          {session.user.image && (
            <img 
              src={session.user.image} 
              alt={session.user.name || "User"} 
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">Welcome back, {session.user.name}!</h2>
            <p className="text-gray-500">{session.user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-semibold mb-2">Recent Resumes</h3>
            <p className="text-gray-500 text-sm italic">No saved resumes yet.</p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-semibold mb-2">Recent Cover Letters</h3>
            <p className="text-gray-500 text-sm italic">No saved cover letters yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
