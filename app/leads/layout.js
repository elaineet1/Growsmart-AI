import Sidebar from "@/components/shared/Sidebar";
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
