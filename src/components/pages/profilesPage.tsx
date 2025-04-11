import React, { useState, useEffect } from "react";
import GearsBackground from "../dashboard/GearsBackground";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { ProfileGrid, ProfileProps } from "../profiles";
import { useNavigate } from "react-router-dom";
import { getVotingProfiles, getHostingProfiles } from "@/lib/api/profiles";
import { setupTokenRefresh } from "@/lib/api/token-refresh";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const ProfilesPage = () => {
  const [profiles, setProfiles] = useState<ProfileProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Set up token refresh when the page loads
  useEffect(() => {
    const cleanup = setupTokenRefresh(60); // Check every 60 minutes
    return cleanup;
  }, []);

  // Load profiles when the component mounts
  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoading(true);
      try {
        // Get both voting and hosting profiles
        const { data: votingProfiles, error: votingError } =
          await getVotingProfiles();
        const { data: hostingProfiles, error: hostingError } =
          await getHostingProfiles();

        if (votingError) throw votingError;
        if (hostingError) throw hostingError;

        // Combine and format profiles
        const formattedProfiles: ProfileProps[] = [];

        // Add voting profiles
        if (votingProfiles) {
          votingProfiles.forEach((profile) => {
            formattedProfiles.push({
              id: profile.id,
              name: profile.name,
              server: profile.server,
              type: "voting",
              createdAt: new Date(profile.created_at || Date.now()),
              updatedAt: new Date(profile.updated_at || Date.now()),
            });
          });
        }

        // Add hosting profiles
        if (hostingProfiles) {
          hostingProfiles.forEach((profile) => {
            formattedProfiles.push({
              id: profile.id,
              name: profile.name,
              server: profile.server,
              type: "hosting",
              createdAt: new Date(profile.created_at || Date.now()),
              updatedAt: new Date(profile.updated_at || Date.now()),
            });
          });
        }

        // Sort by updated date (newest first)
        formattedProfiles.sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
        );

        setProfiles(formattedProfiles);
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
  }, []);

  const openDiscord = () => {
    window.open("https://discord.gg/5MbAqAhaCR", "_blank");
  };

  const addProfile = () => {
    // Navigate to profile creation page
    navigate("/profiles/create");
  };

  const handleEditProfile = (id: string, type: string) => {
    navigate(`/profiles/edit/${id}?mode=${type}`);
  };

  return (
    <div className="min-h-screen">
      <GearsBackground />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {"Your profiles".split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block">
                  {word.split("").map((letter, index) => (
                    <motion.span
                      key={index}
                      className={`inline-block ${wordIndex === 1 && index < 8 ? "text-green-400" : ""}`}
                      initial={{ y: 0 }}
                      animate={{ y: [-20, 0] }}
                      transition={{
                        delay: (wordIndex * word.length + index) * 0.05,
                        duration: 0.5,
                        times: [0, 1],
                        ease: "easeOut",
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                  {wordIndex === 0 && (
                    <span className="inline-block">&nbsp;</span>
                  )}
                </span>
              ))}
            </motion.h1>
            <p className="text-gray-600">Manage your profiles</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => navigate("/dashboard")}
              className="text-white h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <ArrowLeft className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400" />
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
            <Button
              onClick={openDiscord}
              className="text-white h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
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
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
          </div>
        ) : (
          <ProfileGrid
            profiles={profiles}
            onAddProfile={addProfile}
            onEditProfile={handleEditProfile}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilesPage;
