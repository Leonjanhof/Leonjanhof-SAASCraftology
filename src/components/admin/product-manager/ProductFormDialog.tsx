import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { ProductFormData, Product } from "./types";

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProductFormData;
  editingProduct: Product | null;
  isSubmitting: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onFeatureChange: (index: number, value: string) => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  isOpen,
  onOpenChange,
  formData,
  editingProduct,
  isSubmitting,
  onInputChange,
  onSwitchChange,
  onFeatureChange,
  onAddFeature,
  onRemoveFeature,
  onSubmit,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                  onSwitchChange("icon_name", value as any)
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
              onChange={onInputChange}
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
                  onChange={(e) => onFeatureChange(index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onRemoveFeature(index)}
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
              onClick={onAddFeature}
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
                  onSwitchChange("is_subscription", checked)
                }
              />
              <Label htmlFor="is_subscription">Subscription Product</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) =>
                  onSwitchChange("is_popular", checked)
                }
              />
              <Label htmlFor="is_popular">Mark as Popular</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
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
  );
};

export default ProductFormDialog;
