import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface MicrosoftAccountProps {
  id: string;
  username: string;
  onRemove: (id: string) => void;
}

const MicrosoftAccountRow: React.FC<MicrosoftAccountProps> = ({
  id,
  username,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/minecraft/svg?seed=${username}`}
            alt={username}
          />
          <AvatarFallback className="bg-gray-100">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-green-600">{username}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(id)}
        className="h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MicrosoftAccountRow;
