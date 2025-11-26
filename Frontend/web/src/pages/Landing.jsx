import { useState } from "react";
import { Header } from "../components/Header";
import { Drawer } from "../components/StrayAnimalManagement/Drawer";

const Landing = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />

      <div className="flex">
        <Drawer isOpen={isDrawerOpen} />

        {/* Main Content */}
        <div
          className={`flex-1 ${
            isDrawerOpen ? "ml-64" : "ml-0"
          } transition-all duration-300`}
        >
          <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
              <h1 className="text-2xl font-bold text-indigo-600 mb-4">
                Welcome to your Dashboard!
              </h1>
              <p className="text-gray-600">You've successfully logged in.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
