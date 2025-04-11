import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus } from "lucide-react";
import ProfileGrid from "./ProfileGrid";
import {
  getVotingProfiles,
  getHostingProfiles,
  deleteVotingProfile,
  deleteHostingProfile,
} from "@/lib/api/profiles";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";

interface Profile {
  id: string;
  name: string;
  server: string;
  protocol: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  hub_settings?: any;
  afk_settings?: any;
  reconnect_settings?: any;
}

const ProfileManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("voting");
  const [votingProfiles, setVotingProfiles] = useState<Profile[]>([]);
  const [hostingProfiles, setHostingProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        // Fetch profiles
        const { data: votingData, error: votingError } =
          await getVotingProfiles();
        if (votingError) throw votingError;

        const { data: hostingData, error: hostingError } =
          await getHostingProfiles();
        if (hostingError) throw hostingError;

        setVotingProfiles(votingData || []);
        setHostingProfiles(hostingData || []);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        toast({
          title: "Error",
          description: "Failed to load profiles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();

    // Set up real-time subscription for profile changes
    const votingSubscription = supabase
      .channel("profile_voting_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profile_voting" },
        fetchProfiles,
      )
      .subscribe();

    const hostingSubscription = supabase
      .channel("profile_hosting_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profile_hosting" },
        fetchProfiles,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votingSubscription);
      supabase.removeChannel(hostingSubscription);
    };
  }, [navigate]);

  const handleCreateProfile = (mode: string) => {
    navigate(`/profiles/create?mode=${mode}`);
  };

  const handleEditProfile = (id: string, mode: string) => {
    navigate(`/profiles/edit/${id}?mode=${mode}`);
  };

  const handleDeleteProfile = async (id: string, mode: string) => {
    try {
      let result;
      if (mode === "voting") {
        result = await deleteVotingProfile(id);
        if (result.error) throw result.error;
      } else {
        result = await deleteHostingProfile(id);
        if (result.error) throw result.error;
      }

      if (result.success) {
        toast({
          title: "Success",
          description: "Profile deleted successfully",
        });

        // Update the local state
        if (mode === "voting") {
          setVotingProfiles(votingProfiles.filter((p) => p.id !== id));
        } else {
          setHostingProfiles(hostingProfiles.filter((p) => p.id !== id));
        }
      } else {
        throw new Error("Failed to delete profile");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg">
      <CardContent className="p-6">
        <Tabs
          defaultValue="voting"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="voting">Voting Profiles</TabsTrigger>
              <TabsTrigger value="hosting">Hosting Profiles</TabsTrigger>
            </TabsList>
            <Button
              onClick={() => handleCreateProfile(activeTab)}
              className="bg-green-400 text-white hover:bg-white hover:text-green-400 hover:border-green-400 border border-transparent hover:border-green-400 transition-colors duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Profile
            </Button>
          </div>

          <TabsContent value="voting" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
              </div>
            ) : votingProfiles.length > 0 ? (
              <ProfileGrid
                profiles={votingProfiles.map((p) => ({
                  id: p.id,
                  name: p.name,
                  server: p.server,
                  protocol: p.protocol,
                  mode: "voting",
                  createdAt: p.created_at,
                }))}
                onEdit={(id) => handleEditProfile(id, "voting")}
                onDelete={(id) => handleDeleteProfile(id, "voting")}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No voting profiles found</p>
                <Button
                  onClick={() => handleCreateProfile("voting")}
                  variant="outline"
                  className="mt-4 border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
                >
                  Create your first voting profile
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hosting" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
              </div>
            ) : hostingProfiles.length > 0 ? (
              <ProfileGrid
                profiles={hostingProfiles.map((p) => ({
                  id: p.id,
                  name: p.name,
                  server: p.server,
                  protocol: p.protocol,
                  mode: "hosting",
                  createdAt: p.created_at,
                }))}
                onEdit={(id) => handleEditProfile(id, "hosting")}
                onDelete={(id) => handleDeleteProfile(id, "hosting")}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No hosting profiles found</p>
                <Button
                  onClick={() => handleCreateProfile("hosting")}
                  variant="outline"
                  className="mt-4 border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
                >
                  Create your first hosting profile
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileManager;
