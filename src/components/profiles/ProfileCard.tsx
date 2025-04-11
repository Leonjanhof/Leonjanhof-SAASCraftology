import React from "react";
import { motion } from "framer-motion";
import {
  User,
  MoreVertical,
  Edit,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export interface ProfileProps {
  id: string;
  name: string;
  createdAt: Date;
  type?: string;
  server?: string;
}

interface ProfileCardProps {
  profile: ProfileProps;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string, type: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(profile.id);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard", {
      state: { profileId: profile.id, profileType: profile.type },
    });
  };

  const handleEditClick = () => {
    navigate(`/profiles/edit/${profile.id}?mode=${profile.type}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(profile.id, profile.type || "voting");
    setShowDeleteDialog(false);
  };

  return (
    <>
      <motion.div
        key={profile.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={handleCardClick}
        className={`relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] h-64 bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-center items-center border ${isSelected ? "border-green-400 border-2 border-dashed" : "border-gray-100"} hover:shadow-lg transition-all duration-300 cursor-pointer`}
      >
        {isSelected && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDashboardClick}
                  className="cursor-pointer"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleEditClick}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="cursor-pointer text-red-500 focus:text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          Created {profile.createdAt.toLocaleDateString()}
        </p>
        {profile.server && (
          <p className="text-xs text-gray-400 mt-1">Server: {profile.server}</p>
        )}
        {profile.type && (
          <span
            className={`mt-3 px-2 py-1 rounded-full text-xs ${profile.type === "voting" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}
          >
            {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)}
          </span>
        )}
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the profile "{profile.name}". This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfileCard;
