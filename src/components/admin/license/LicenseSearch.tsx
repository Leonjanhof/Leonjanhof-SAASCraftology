import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";

interface LicenseSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
}

const LicenseSearch: React.FC<LicenseSearchProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  onRefresh,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by license key, product, or user"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pl-8 w-64"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onSearch}>
          Search
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default LicenseSearch;
