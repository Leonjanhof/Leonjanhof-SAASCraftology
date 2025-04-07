import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HubSetting = "command" | "compass" | "none";
type GridSize = "none" | "9x1" | "9x2" | "9x3" | "9x4" | "9x5" | "9x6";
type SelectedSquare = { row: number; col: number } | null;

interface HubSetupFormProps {
  onContinue: () => void;
  onCancel: () => void;
}

const HubSetupForm: React.FC<HubSetupFormProps> = ({
  onContinue,
  onCancel,
}) => {
  const [selectedSetting, setSelectedSetting] = useState<HubSetting>("none");
  const [commandInput, setCommandInput] = useState("");
  const [gridSize, setGridSize] = useState<GridSize>("none");
  const [selectedSquare, setSelectedSquare] = useState<SelectedSquare>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onContinue();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettingChange = (setting: HubSetting) => {
    setSelectedSetting(setting);
    if (setting !== "compass") {
      setGridSize("none");
      setSelectedSquare(null);
    }
    if (setting !== "command") {
      setCommandInput("");
    }
  };

  const renderGrid = () => {
    if (!gridSize || gridSize === "none") return null;

    const [rows, cols] = gridSize.split("x").map(Number);
    return (
      <div className="mt-4 border rounded-lg p-4 bg-white overflow-x-auto">
        <div
          className="grid gap-1 w-full"
          style={{ gridTemplateColumns: `repeat(9, minmax(24px, 1fr))` }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const isSelected =
              selectedSquare?.row === row && selectedSquare?.col === col;

            return (
              <div
                key={index}
                onClick={() => {
                  if (
                    selectedSquare?.row === row &&
                    selectedSquare?.col === col
                  ) {
                    setSelectedSquare(null); // Deselect if clicking the same square
                  } else {
                    setSelectedSquare({ row, col }); // Select new square
                  }
                }}
                className={cn(
                  "aspect-square border-2 rounded-md cursor-pointer transition-all h-6",
                  "hover:border-green-400/50",
                  isSelected
                    ? "border-green-400 border-dashed bg-green-50"
                    : "border-gray-200",
                )}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <ProfileForm
      title="Hub setup"
      description="Configure your hub settings"
      onCancel={onCancel}
      onContinue={handleContinue}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {["command", "compass", "none"].map((setting) => (
          <div
            key={setting}
            onClick={() => handleSettingChange(setting as HubSetting)}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all",
              "hover:border-green-400/50",
              selectedSetting === setting
                ? "border-green-400 border-dashed"
                : "border-gray-200",
            )}
          >
            <span className="text-green-600 font-medium capitalize">
              {setting}
            </span>
          </div>
        ))}

        {selectedSetting === "command" && (
          <div className="mt-4 space-y-2">
            <Input
              placeholder="Enter command..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="text-green-600 focus-visible:ring-green-400 placeholder:text-green-600/50"
            />
          </div>
        )}

        {selectedSetting === "compass" && (
          <div className="mt-4 space-y-4">
            <Select
              value={gridSize}
              onValueChange={(value) => setGridSize(value as GridSize)}
            >
              <SelectTrigger className="w-full focus:ring-green-400 text-green-600">
                <SelectValue placeholder="Select grid size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {["9x1", "9x2", "9x3", "9x4", "9x5", "9x6"].map((size) => (
                  <SelectItem
                    key={size}
                    value={size}
                    className="text-green-600 hover:text-green-600"
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {renderGrid()}
          </div>
        )}
      </div>
    </ProfileForm>
  );
};

export default HubSetupForm;
