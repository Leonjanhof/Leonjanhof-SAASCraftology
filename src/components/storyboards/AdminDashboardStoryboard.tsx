import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Users, Database, Settings } from "lucide-react";

export default function AdminDashboardStoryboard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage your application settings and users
            </p>
          </div>
          <Button className="bg-green-400 hover:text-green-400 text-white relative overflow-hidden group">
            <span className="relative z-10 transition-colors duration-300">
              <ShieldAlert className="h-4 w-4 mr-2 inline" />
              Admin Mode
            </span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-400" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">128</div>
              <p className="text-sm text-gray-500">Total registered users</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Database className="h-5 w-5 mr-2 text-green-400" />
                Licenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">85</div>
              <p className="text-sm text-gray-500">Active licenses</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Licenses
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Settings className="h-5 w-5 mr-2 text-green-400" />
                System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Active</div>
              <p className="text-sm text-gray-500">System status</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "User Created",
                  details: "New user registered: john.doe@example.com",
                  time: "2 hours ago",
                },
                {
                  action: "License Activated",
                  details: "License #LIC-1234 activated by user ID: 567",
                  time: "5 hours ago",
                },
                {
                  action: "Role Changed",
                  details: "User jane.smith@example.com promoted to admin",
                  time: "1 day ago",
                },
                {
                  action: "System Update",
                  details: "System settings updated by admin",
                  time: "2 days ago",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start pb-3 border-b border-gray-100"
                >
                  <div>
                    <div className="font-medium">{item.action}</div>
                    <div className="text-sm text-gray-500">{item.details}</div>
                  </div>
                  <div className="text-xs text-gray-400">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
