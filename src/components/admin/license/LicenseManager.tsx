import React, { useState, useEffect } from "react";
import { supabase } from "../../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  License,
  LicenseFormData,
  Product,
  User,
  LICENSES_PER_PAGE,
} from "./types";
import LicenseTable from "./LicenseTable";
import LicenseSearch from "./LicenseSearch";
import GenerateLicenseDialog from "./GenerateLicenseDialog";
import ExtendLicenseDialog from "./ExtendLicenseDialog";

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
  const [formData, setFormData] = useState<LicenseFormData>({
    userId: "",
    productName: "",
    expiryDate: undefined,
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

      // Call the database function to get licenses data with pagination
      const { data, error } = await supabase.rpc("get_licenses", {
        p_page: currentPage,
        p_page_size: LICENSES_PER_PAGE,
        p_search_query: searchQuery.trim() !== "" ? searchQuery : null,
      });

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
        "get-user-roles-data",
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
            // Call the generate_license database function
            const { data, error } = await supabase.rpc("generate_license", {
              p_user_id: user.id,
              p_product_name: formData.productName,
              p_expires_at: formData.expiryDate
                ? formData.expiryDate.toISOString()
                : null,
            });

            if (error || !data?.success) {
              errorCount++;
              console.error(
                `Error generating license for ${user.email}:`,
                error || data?.message,
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
        // Call the generate_license database function
        const { data, error } = await supabase.rpc("generate_license", {
          p_user_id: formData.userId,
          p_product_name: formData.productName,
          p_expires_at: formData.expiryDate
            ? formData.expiryDate.toISOString()
            : null,
        });

        if (error) throw error;

        if (!data?.success) {
          throw new Error(data?.message || "Failed to generate license");
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

      // Call the extend_license database function
      const { data, error } = await supabase.rpc("extend_license", {
        p_license_id: selectedLicense.id,
        p_expires_at: expiryDate.toISOString(),
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.message || "Failed to extend license");
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

      // Call the delete_license database function
      const { data, error } = await supabase.rpc("delete_license", {
        p_license_id: licenseToDelete.id,
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete license");
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
        <LicenseSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          onRefresh={fetchLicenses}
        />

        <LicenseTable
          licenses={filteredLicenses}
          isLoading={loading}
          searchQuery={searchQuery}
          licenseToDelete={licenseToDelete}
          isDeleting={isDeleting}
          onExtend={handleOpenExtendDialog}
          onDelete={setLicenseToDelete}
          onConfirmDelete={handleDeleteLicense}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />

        <GenerateLicenseDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData}
          setFormData={setFormData}
          selectAllUsers={selectAllUsers}
          setSelectAllUsers={setSelectAllUsers}
          userSearchQuery={userSearchQuery}
          setUserSearchQuery={setUserSearchQuery}
          filteredUsers={filteredUsers}
          products={products}
          loadingUsers={loadingUsers}
          loadingProducts={loadingProducts}
          isSubmitting={isSubmitting}
          onSubmit={handleGenerateLicense}
          onCancel={handleCloseDialog}
          handleSelectChange={handleSelectChange}
        />

        <ExtendLicenseDialog
          isOpen={isExtendDialogOpen}
          onOpenChange={setIsExtendDialogOpen}
          selectedLicense={selectedLicense}
          expiryDate={expiryDate}
          setExpiryDate={setExpiryDate}
          isSubmitting={isSubmitting}
          onSubmit={handleExtendLicense}
          onCancel={handleCloseExtendDialog}
        />
      </CardContent>
    </Card>
  );
});

export default LicenseManager;
