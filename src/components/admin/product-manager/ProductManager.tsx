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
import { Product, ProductFormData } from "./types";
import ProductTable from "./ProductTable";
import ProductFormDialog from "./ProductFormDialog";

const ProductManager = React.forwardRef((props, ref) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    price_id: "",
    features: [""],
    is_subscription: true,
    is_popular: false,
    icon_name: "Package",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

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
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      price_id: "",
      features: [""],
      is_subscription: true,
      is_popular: false,
      icon_name: "Package",
    });
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        price_id: product.price_id,
        features: product.features,
        is_subscription: product.is_subscription,
        is_popular: product.is_popular,
        icon_name: product.icon_name,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Product description is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      toast({
        title: "Validation Error",
        description: "Valid price is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.price_id.trim()) {
      toast({
        title: "Validation Error",
        description: "Price ID is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate features - remove empty ones but ensure at least one exists
    const validFeatures = formData.features.filter((f) => f.trim() !== "");
    if (validFeatures.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one feature is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Filter out empty features
      const validFeatures = formData.features.filter((f) => f.trim() !== "");

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        price_id: formData.price_id.trim(),
        features: validFeatures,
        is_subscription: formData.is_subscription,
        is_popular: formData.is_popular,
        icon_name: formData.icon_name,
      };

      // Add id if editing an existing product
      if (editingProduct) {
        productData.id = editingProduct.id;
      }

      // Call the save-product edge function instead of direct database access
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-save-product",
        {
          body: {
            product: productData,
            isUpdate: !!editingProduct,
          },
        },
      );

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: editingProduct
          ? "Product updated successfully"
          : "Product created successfully",
      });

      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingProduct ? "update" : "create"} product. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);

      console.log(
        `Attempting to delete product with name: ${productToDelete.name}`,
      );

      // Use the database function to delete the product by name
      const { data, error } = await supabase.rpc("delete_product", {
        p_product_name: productToDelete.name,
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete product");
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Expose fetchProducts method to parent components via ref
  React.useImperativeHandle(ref, () => ({
    fetchProducts,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>
              Manage products displayed in the products section
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ProductTable
          products={products}
          loading={loading}
          productToDelete={productToDelete}
          isDeleting={isDeleting}
          onEdit={handleOpenDialog}
          onDelete={setProductToDelete}
          onConfirmDelete={handleDeleteProduct}
        />

        <ProductFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData}
          editingProduct={editingProduct}
          isSubmitting={isSubmitting}
          onInputChange={handleInputChange}
          onSwitchChange={handleSwitchChange}
          onFeatureChange={handleFeatureChange}
          onAddFeature={addFeature}
          onRemoveFeature={removeFeature}
          onSubmit={handleSubmit}
          onCancel={handleCloseDialog}
        />
      </CardContent>
    </Card>
  );
});

export default ProductManager;
