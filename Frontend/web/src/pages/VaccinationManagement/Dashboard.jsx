import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/VaccinationManagement/Drawer";

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "Maria - City Veterinarian" }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <main
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>

          {/* Empty content area - ready for future content */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Welcome to the Dashboard
              </h2>
              <p className="text-gray-500 mb-6">
                This is a default dashboard layout. Add your content here.
              </p>
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-400">Content Area</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
