import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GearsBackground from "../dashboard/GearsBackground";

interface AdminLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  handleRefresh: () => void;
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  isLoading,
  handleRefresh,
  children,
}) => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      {/* Add GearsBackground component */}
      <GearsBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage your application settings and users
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="mr-2"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {children}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminLayout;
