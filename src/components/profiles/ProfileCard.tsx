import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

export interface ProfileProps {
  id: string;
  name: string;
  createdAt: Date;
}

interface ProfileCardProps {
  profile: ProfileProps;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <motion.div
      key={profile.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] h-64 bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-center items-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <User className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
      <p className="text-sm text-gray-500 mt-1">
        Created {profile.createdAt.toLocaleDateString()}
      </p>
    </motion.div>
  );
};

export default ProfileCard;
