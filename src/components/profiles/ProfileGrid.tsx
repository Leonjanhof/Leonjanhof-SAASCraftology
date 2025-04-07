import React from "react";
import ProfileCard, { ProfileProps } from "./ProfileCard";
import AddProfileCard from "./AddProfileCard";

interface ProfileGridProps {
  profiles: ProfileProps[];
  onAddProfile: () => void;
}

const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  onAddProfile,
}) => {
  return (
    <div className="py-8">
      <div className="flex flex-wrap gap-6">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}

        {/* Add Profile Button */}
        <AddProfileCard onAddProfile={onAddProfile} />
      </div>

      {profiles.length === 0 && (
        <p className="text-gray-500 text-center mt-4">
          Click the box above to create your first profile
        </p>
      )}
    </div>
  );
};

export default ProfileGrid;
