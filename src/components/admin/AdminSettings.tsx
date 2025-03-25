import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          System configuration options will be available here.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
