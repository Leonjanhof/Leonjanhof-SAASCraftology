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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Package,
  DollarSign,
  Tag,
  List,
  Vote,
  Bot,
  ShieldCheck,
  Zap,
  Code,
  Cpu,
  Database,
  Globe,
  Rocket,
  Server,
  Terminal,
  Wrench,
  Gamepad2,
  Cog,
} from "lucide-react";

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

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  price_id: string;
  features: string[];
  is_subscription: boolean;
  is_popular: boolean;
  icon_name: string;
}

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

      // Call the delete-product edge function instead of direct database access
      console.log(
        `Attempting to delete product with ID: ${productToDelete.id}`,
      );

      // Use the edge function to delete the product
      const { data, error } = await supabase.functions.invoke(
        "delete-product",
        {
          body: {
            product_id: productToDelete.product_id || productToDelete.id,
          },
        },
      );

      if (error) throw error;

      if (data?.success === false) {
        throw new Error(data.message || "Failed to delete product");
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
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <p className="text-gray-500">
              No products found. Add your first product!
            </p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>
                      {product.is_subscription ? "Subscription" : "One-time"}
                    </TableCell>
                    <TableCell>{product.is_popular ? "Yes" : "No"}</TableCell>
                    <TableCell>{product.features.length} features</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
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
                                Delete Product
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this product?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  setProductToDelete(product);
                                  setTimeout(handleDeleteProduct, 100);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                {isDeleting &&
                                productToDelete?.id === product.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete Product"
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
          </div>
        )}

        {/* Product Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update the product details below"
                  : "Fill in the details to create a new product"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <Package className="h-4 w-4 mr-1 text-green-400" />
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Autovoter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-400" />
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 5.00"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_id" className="flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-green-400" />
                    Stripe Price ID
                  </Label>
                  <Input
                    id="price_id"
                    name="price_id"
                    value={formData.price_id}
                    onChange={handleInputChange}
                    placeholder="e.g., price_1R1A9uGLqZ8YjU1vEkXXC79n"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon_name" className="flex items-center">
                    <Package className="h-4 w-4 mr-1 text-green-400" />
                    Icon
                  </Label>
                  <Select
                    value={formData.icon_name}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, icon_name: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Package">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          <span>Package</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Vote">
                        <div className="flex items-center">
                          <Vote className="h-4 w-4 mr-2" />
                          <span>Vote</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Bot">
                        <div className="flex items-center">
                          <Bot className="h-4 w-4 mr-2" />
                          <span>Bot</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ShieldCheck">
                        <div className="flex items-center">
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          <span>ShieldCheck</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Zap">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          <span>Zap</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Code">
                        <div className="flex items-center">
                          <Code className="h-4 w-4 mr-2" />
                          <span>Code</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Cpu">
                        <div className="flex items-center">
                          <Cpu className="h-4 w-4 mr-2" />
                          <span>Cpu</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Database">
                        <div className="flex items-center">
                          <Database className="h-4 w-4 mr-2" />
                          <span>Database</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Globe">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          <span>Globe</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Rocket">
                        <div className="flex items-center">
                          <Rocket className="h-4 w-4 mr-2" />
                          <span>Rocket</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Server">
                        <div className="flex items-center">
                          <Server className="h-4 w-4 mr-2" />
                          <span>Server</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Terminal">
                        <div className="flex items-center">
                          <Terminal className="h-4 w-4 mr-2" />
                          <span>Terminal</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Wrench">
                        <div className="flex items-center">
                          <Wrench className="h-4 w-4 mr-2" />
                          <span>Wrench</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Gamepad2">
                        <div className="flex items-center">
                          <Gamepad2 className="h-4 w-4 mr-2" />
                          <span>Gamepad</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Cog">
                        <div className="flex items-center">
                          <Cog className="h-4 w-4 mr-2" />
                          <span>Cog</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <List className="h-4 w-4 mr-1 text-green-400" />
                  Features
                </Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={feature}
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                      placeholder={`Feature ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      disabled={formData.features.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Feature
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_subscription"
                    checked={formData.is_subscription}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_subscription", checked)
                    }
                  />
                  <Label htmlFor="is_subscription">Subscription Product</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_popular", checked)
                    }
                  />
                  <Label htmlFor="is_popular">Mark as Popular</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingProduct ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingProduct ? "Update Product" : "Create Product"}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
});

export default ProductManager;
