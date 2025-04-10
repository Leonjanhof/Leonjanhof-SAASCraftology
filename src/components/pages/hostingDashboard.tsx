import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GearsBackground from "../dashboard/GearsBackground";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, Key, Plus, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getHostingProfiles } from "@/lib/api/profiles";
import { ProfileProps } from "../profiles";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const HostingDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileProps[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ProfileProps | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Get the profileId from location state
  const profileId = location.state?.profileId;
  const profileType = location.state?.profileType || "hosting";

  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoading(true);
      try {
        const { data: hostingProfiles, error } = await getHostingProfiles();

        if (error) throw error;

        // Format profiles
        const formattedProfiles: ProfileProps[] = [];

        if (hostingProfiles) {
          hostingProfiles.forEach((profile) => {
            formattedProfiles.push({
              id: profile.id,
              name: profile.name,
              server: profile.server,
              type: "hosting",
              createdAt: new Date(profile.created_at || Date.now()),
            });
          });
        }

        setProfiles(formattedProfiles);

        // Set current profile
        if (profileId) {
          const profile = formattedProfiles.find((p) => p.id === profileId);
          if (profile) {
            setCurrentProfile(profile);
          } else if (formattedProfiles.length > 0) {
            setCurrentProfile(formattedProfiles[0]);
          }
        } else if (formattedProfiles.length > 0) {
          setCurrentProfile(formattedProfiles[0]);
        }
      } catch (error) {
        console.error("Error loading profiles:", error);
        toast({
          title: "Error",
          description: "Failed to load profiles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, [profileId]);

  const openDiscord = () => {
    window.open("https://discord.gg/5MbAqAhaCR", "_blank");
  };

  const handleProfileSelect = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      setCurrentProfile(profile);
      // Update the URL without reloading the page
      window.history.replaceState(
        { profileId: profile.id, profileType: profile.type },
        "",
        window.location.pathname,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <GearsBackground />
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10 flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GearsBackground />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-8 bg-transparent rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <motion.h1
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {currentProfile ? (
                <div className="flex items-center">
                  <span>Your </span>
                  <span className="text-green-400 mx-1">
                    {currentProfile.name}
                  </span>
                  <span>Dashboard </span>
                  <span className="ml-2 text-xs text-purple-500 px-2 py-0.5 rounded-full bg-purple-50 font-medium">
                    Hosting
                  </span>
                </div>
              ) : (
                "dashboard"
              )}
            </motion.h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <Home className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400" />
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>

            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <Key className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400" />
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>

            <Button
              onClick={() => navigate("/profiles")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <Plus className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400" />
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>

            <Button
              onClick={openDiscord}
              variant="ghost"
              size="icon"
              className="h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <svg
                  className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50"
                >
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">
                    {currentProfile?.name || "Select Profile"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {profiles.map((profile) => (
                  <DropdownMenuItem
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile.id)}
                    className={`cursor-pointer ${currentProfile?.id === profile.id ? "bg-gray-100" : ""}`}
                  >
                    {profile.name}
                    <span className="ml-2 text-xs text-purple-500 px-1.5 py-0.5 rounded-full bg-purple-50">
                      Hosting
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-transparent backdrop-blur-sm rounded-lg shadow-md p-6 min-h-[500px]">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome to your Hosting dashboard
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              This dashboard is currently empty. Future features and statistics
              will appear here as they become available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostingDashboard;
