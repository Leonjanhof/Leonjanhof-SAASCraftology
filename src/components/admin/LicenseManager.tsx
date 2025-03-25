import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Key,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";

interface License {
  id: string;
  user_id: string;
  product_name: string;
  license_key: string;
  hwid: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  last_reset_date?: string | null;
  expires_at?: string | null;
  user_email?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_id: string;
  features: string[];
  is_subscription: boolean;
  is_popular: boolean;
  icon_name: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role_name: string;
}

const LICENSES_PER_PAGE = 10;

const LicenseManager = React.forwardRef((props, ref) => {
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<License | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);

  // Form data for new license
  const [formData, setFormData] = useState({
    userId: "",
    productName: "",
    expiryDate: undefined as Date | undefined,
  });

  useEffect(() => {
    fetchLicenses();
    fetchProducts();
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    // Filter licenses based on search query
    if (searchQuery.trim() === "") {
      setFilteredLicenses(licenses);
    } else {
      const filtered = licenses.filter(
        (license) =>
          license.license_key
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          license.product_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (license.user_email &&
            license.user_email
              .toLowerCase()
              .includes(searchQuery.toLowerCase())),
      );
      setFilteredLicenses(filtered);
    }
  }, [searchQuery, licenses]);

  // Filter users based on search query
  useEffect(() => {
    if (userSearchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchQuery, users]);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(totalCount / LICENSES_PER_PAGE)));
  }, [totalCount]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);

      // Call the edge function to get licenses data with pagination
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-get-licenses",
        {
          body: {
            page: currentPage,
            pageSize: LICENSES_PER_PAGE,
            searchQuery: searchQuery.trim() !== "" ? searchQuery : undefined,
          },
        },
      );

      if (error) {
        throw error;
      }

      if (!data || !data.data) {
        setLicenses([]);
        setFilteredLicenses([]);
        setTotalCount(0);
        return;
      }

      setLicenses(data.data);
      setFilteredLicenses(data.data);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching licenses:", error);
      toast({
        title: "Error",
        description: "Failed to load licenses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-get-user-roles-data",
        {
          body: {
            page: 1,
            pageSize: 100, // Get a reasonable number of users
          },
        },
      );

      if (error) throw error;

      setUsers(data?.data || []);
      setFilteredUsers(data?.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      productName: "",
      expiryDate: undefined,
    });
    setUserSearchQuery("");
    setSelectAllUsers(false);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleOpenExtendDialog = (license: License) => {
    setSelectedLicense(license);
    // Set default expiry date to 30 days from now if no current expiry
    const defaultDate = license.expires_at
      ? new Date(license.expires_at)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    setExpiryDate(defaultDate);
    setIsExtendDialogOpen(true);
  };

  const handleCloseExtendDialog = () => {
    setIsExtendDialogOpen(false);
    setSelectedLicense(null);
    setExpiryDate(undefined);
  };

  const validateForm = () => {
    if (!selectAllUsers && !formData.userId) {
      toast({
        title: "Validation Error",
        description: "Please select a user or check 'All Users'",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.productName) {
      toast({
        title: "Validation Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleGenerateLicense = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      if (selectAllUsers) {
        // Generate licenses for all users
        let successCount = 0;
        let errorCount = 0;

        for (const user of users) {
          try {
            const licenseData = {
              userId: user.id,
              productName: formData.productName,
              expiresAt: formData.expiryDate
                ? formData.expiryDate.toISOString()
                : null,
            };

            const { data, error } = await supabase.functions.invoke(
              "supabase-functions-generate-license",
              {
                body: licenseData,
              },
            );

            if (error || data?.error) {
              errorCount++;
              console.error(
                `Error generating license for ${user.email}:`,
                error || data?.error,
              );
            } else {
              successCount++;
            }
          } catch (err) {
            errorCount++;
            console.error(`Error generating license for ${user.email}:`, err);
          }
        }

        toast({
          title: "Bulk License Generation",
          description: `Successfully generated ${successCount} licenses. Failed: ${errorCount}`,
          variant: errorCount > 0 ? "default" : "default",
        });
      } else {
        // Generate license for a single user
        const licenseData = {
          userId: formData.userId,
          productName: formData.productName,
          expiresAt: formData.expiryDate
            ? formData.expiryDate.toISOString()
            : null,
        };

        // Call the generate-license edge function
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-generate-license",
          {
            body: licenseData,
          },
        );

        if (error) throw error;

        if (data?.error) {
          throw new Error(data.error);
        }

        toast({
          title: "Success",
          description: "License generated successfully",
        });
      }

      handleCloseDialog();
      fetchLicenses();
    } catch (error) {
      console.error("Error generating license:", error);
      toast({
        title: "Error",
        description: `Failed to generate license. ${error.message || "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtendLicense = async () => {
    if (!selectedLicense || !expiryDate) {
      toast({
        title: "Validation Error",
        description: "Please select a valid expiry date",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Call the extend-license edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-extend-license",
        {
          body: {
            licenseId: selectedLicense.id,
            expiresAt: expiryDate.toISOString(),
          },
        },
      );

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "License extended successfully",
      });

      handleCloseExtendDialog();
      fetchLicenses();
    } catch (error) {
      console.error("Error extending license:", error);
      toast({
        title: "Error",
        description: `Failed to extend license. ${error.message || "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLicense = async () => {
    if (!licenseToDelete) return;

    try {
      setIsDeleting(true);

      // Call the delete-license edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-delete-license",
        {
          body: {
            licenseId: licenseToDelete.id,
          },
        },
      );

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "License deleted successfully",
      });

      setLicenseToDelete(null);
      fetchLicenses();
    } catch (error) {
      console.error("Error deleting license:", error);
      toast({
        title: "Error",
        description: `Failed to delete license. ${error.message || "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLicenses();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Expose fetchLicenses method to parent components via ref
  React.useImperativeHandle(ref, () => ({
    fetchLicenses,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>License Management</CardTitle>
            <CardDescription>
              Manage licenses for users and products
            </CardDescription>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" /> Generate License
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by license key, product, or user"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8 w-64"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLicenses}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <p className="text-gray-500">
              {searchQuery
                ? "No licenses found matching your search."
                : "No licenses found in the system."}
            </p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Key</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-xs">
                      {license.license_key}
                    </TableCell>
                    <TableCell>{license.user_email || "Unknown"}</TableCell>
                    <TableCell>{license.product_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={license.active ? "default" : "outline"}
                        className={
                          license.active
                            ? "bg-green-400 hover:bg-green-500"
                            : "text-gray-500 border-gray-300"
                        }
                      >
                        {license.active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(license.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {license.expires_at
                        ? new Date(license.expires_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenExtendDialog(license)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete License
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this license?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  setLicenseToDelete(license);
                                  setTimeout(handleDeleteLicense, 100);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                {isDeleting &&
                                licenseToDelete?.id === license.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete License"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing{" "}
                {filteredLicenses.length > 0
                  ? (currentPage - 1) * LICENSES_PER_PAGE + 1
                  : 0}{" "}
                to {Math.min(currentPage * LICENSES_PER_PAGE, totalCount)} of{" "}
                {totalCount} licenses
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="h-9 w-9 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Generate License Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New License</DialogTitle>
              <DialogDescription>
                Create a new license for a user and product
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="selectAllUsers"
                    checked={selectAllUsers}
                    onCheckedChange={(checked) => {
                      setSelectAllUsers(checked === true);
                      if (checked) {
                        setFormData((prev) => ({ ...prev, userId: "" }));
                      }
                    }}
                  />
                  <Label htmlFor="selectAllUsers" className="cursor-pointer">
                    Generate for all users
                  </Label>
                </div>

                {!selectAllUsers && (
                  <>
                    <Label htmlFor="userId">
                      <div className="flex items-center">
                        User
                        {loadingUsers && (
                          <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                        )}
                      </div>
                    </Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by email or name"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select
                      value={formData.userId}
                      onValueChange={(value) =>
                        handleSelectChange("userId", value)
                      }
                      disabled={loadingUsers || selectAllUsers}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email} ({user.full_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filteredUsers.length === 0 && userSearchQuery && (
                      <p className="text-xs text-gray-500 mt-1">
                        No users found matching your search
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productName">
                  <div className="flex items-center">
                    Product
                    {loadingProducts && (
                      <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                    )}
                  </div>
                </Label>
                <Select
                  value={formData.productName}
                  onValueChange={(value) =>
                    handleSelectChange("productName", value)
                  }
                  disabled={loadingProducts}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <DatePicker
                  date={formData.expiryDate}
                  setDate={(date) =>
                    setFormData((prev) => ({ ...prev, expiryDate: date }))
                  }
                />
                <p className="text-xs text-gray-500">
                  Leave blank for non-expiring license
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateLicense}
                disabled={isSubmitting}
                className="bg-green-400 hover:text-green-400 text-white relative overflow-hidden group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="relative z-10 transition-colors duration-300">
                      Generate License
                    </span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend License Dialog */}
        <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Extend License</DialogTitle>
              <DialogDescription>
                Update the expiration date for this license
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {selectedLicense && (
                <div className="space-y-1">
                  <Label>License Key</Label>
                  <div className="p-2 bg-gray-100 rounded font-mono text-xs">
                    {selectedLicense.license_key}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="expiryDate">New Expiry Date</Label>
                <DatePicker date={expiryDate} setDate={setExpiryDate} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseExtendDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleExtendLicense}
                disabled={isSubmitting || !expiryDate}
                className="bg-green-400 hover:text-green-400 text-white relative overflow-hidden group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="relative z-10 transition-colors duration-300">
                      Update Expiry
                    </span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
});

export default LicenseManager;
