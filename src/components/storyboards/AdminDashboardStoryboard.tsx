import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { UserCog } from "lucide-react";
import UserRoleManager from "../admin/UserRoleManager";
import ProductManager from "../admin/ProductManager";
import LicenseManager from "../admin/LicenseManager";
import AdminOverview from "../admin/AdminOverview";
import AdminSettings from "../admin/AdminSettings";
import AdminLayout from "../admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";

export default function AdminDashboardStoryboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Create references to the components
  const userRoleManagerRef = useRef(null);
  const productManagerRef = useRef(null);
  const licenseManagerRef = useRef(null);

  const handleRefresh = () => {
    setIsLoading(true);

    // Determine what to refresh based on the active tab
    switch (activeTab) {
      case "overview":
        toast({
          title: "Refreshing",
          description: "Dashboard statistics are being updated",
        });
        break;
      case "users":
        // Access the UserRoleManager component and call its fetchUsers method
        if (
          userRoleManagerRef.current &&
          userRoleManagerRef.current.fetchUsers
        ) {
          userRoleManagerRef.current.fetchUsers();
          toast({
            title: "Refreshing",
            description: "User management data is being updated",
          });
        } else {
          toast({
            title: "Refreshing",
            description: "User management data is being updated",
          });
        }
        break;
      case "products":
        // Access the ProductManager component and call its fetchProducts method
        if (
          productManagerRef.current &&
          productManagerRef.current.fetchProducts
        ) {
          productManagerRef.current.fetchProducts();
          toast({
            title: "Refreshing",
            description: "Product data is being updated",
          });
        } else {
          toast({
            title: "Refreshing",
            description: "Product data is being updated",
          });
        }
        break;
      case "licenses":
        // Access the LicenseManager component and call its fetchLicenses method
        if (
          licenseManagerRef.current &&
          licenseManagerRef.current.fetchLicenses
        ) {
          licenseManagerRef.current.fetchLicenses();
          toast({
            title: "Refreshing",
            description: "License data is being updated",
          });
        } else {
          toast({
            title: "Refreshing",
            description: "License data is being updated",
          });
        }
        break;
      case "settings":
        // For now, just refresh the system status
        toast({
          title: "Refreshing",
          description: "System settings are being updated",
        });
        break;
      default:
        toast({
          title: "Refreshing",
          description: "Dashboard data is being updated",
        });
    }

    // Simulate loading state for better UX
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isLoading={isLoading}
      handleRefresh={handleRefresh}
    >
      <TabsContent value="overview" className="mt-6">
        <AdminOverview onTabChange={setActiveTab} />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardContent className="pt-6">
              <UserRoleManager ref={userRoleManagerRef} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="products" className="mt-6">
        <div className="grid grid-cols-1 gap-6">
          <ProductManager ref={productManagerRef} />
        </div>
      </TabsContent>

      <TabsContent value="licenses" className="mt-6">
        <div className="grid grid-cols-1 gap-6">
          <LicenseManager ref={licenseManagerRef} />
        </div>
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <AdminSettings />
      </TabsContent>
    </AdminLayout>
  );
}
