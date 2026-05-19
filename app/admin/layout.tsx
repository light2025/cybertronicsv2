import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';

// TODO(auth): protect this layout with Supabase Auth role check.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
