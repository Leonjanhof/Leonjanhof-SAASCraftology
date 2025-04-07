import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface AddProfileCardProps {
  onAddProfile: () => void;
}

const AddProfileCard: React.FC<AddProfileCardProps> = ({ onAddProfile }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onAddProfile}
      className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] h-64 bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-center items-center border border-dashed border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
        <Plus className="h-8 w-8 text-green-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">Add Profile</h3>
      <p className="text-sm text-gray-500 mt-1">Create a new profile</p>
    </motion.div>
  );
};

export default AddProfileCard;
