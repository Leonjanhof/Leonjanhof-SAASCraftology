import React, { useState } from "react";
import ProfileCard, { ProfileProps } from "./ProfileCard";
import AddProfileCard from "./AddProfileCard";

interface ProfileGridProps {
  profiles: ProfileProps[];
  onAddProfile: () => void;
  onEditProfile?: (id: string, type: string) => void;
  onDeleteProfile?: (id: string, type: string) => void;
}

const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );

  const handleProfileSelect = (id: string) => {
    setSelectedProfileId(id === selectedProfileId ? null : id);
  };

  const handleProfileDelete = (id: string, type: string) => {
    if (onDeleteProfile) {
      onDeleteProfile(id, type);
      setSelectedProfileId(null);
    }
  };

  // Handle click outside to deselect
  const handleBackgroundClick = () => {
    setSelectedProfileId(null);
  };

  return (
    <div className="py-8" onClick={handleBackgroundClick}>
      <div className="flex flex-wrap gap-6">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isSelected={selectedProfileId === profile.id}
            onSelect={handleProfileSelect}
            onDelete={handleProfileDelete}
          />
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
