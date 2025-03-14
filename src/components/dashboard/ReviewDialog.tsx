import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";

interface ReviewDialogProps {
  licenses: Array<{ product_name: string }>;
}

export default function ReviewDialog({ licenses }: ReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [existingReviews, setExistingReviews] = useState<
    Record<string, { rating: number; review_text: string }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedProduct || !reviewText) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Check if user already has a review for this product
    if (existingReviews[selectedProduct]) {
      toast({
        title: "Error",
        description: "You've already reviewed this product",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if user already has a review for this product
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_name", selectedProduct)
        .single();

      if (existingReview) {
        // Update existing review instead of creating a new one
        const { error } = await supabase
          .from("reviews")
          .update({
            rating,
            review_text: reviewText,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your review has been updated",
        });
      } else {
        // Insert new review
        const { error } = await supabase.from("reviews").insert({
          user_id: user.id,
          product_name: selectedProduct,
          rating,
          review_text: reviewText,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your review has been submitted",
        });
      }

      setIsOpen(false);
      setSelectedProduct("");
      setRating(5);
      setReviewText("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load existing reviews when dialog opens
  const loadExistingReviews = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("reviews")
        .select("product_name, rating, review_text")
        .eq("user_id", user.id);

      if (data && data.length > 0) {
        const reviewMap = {};
        data.forEach((review) => {
          reviewMap[review.product_name] = {
            rating: review.rating,
            review_text: review.review_text,
          };
        });
        setExistingReviews(reviewMap);
      }
    } catch (error) {
      console.error("Error loading existing reviews:", error);
    }
  };

  // When product selection changes, load existing review if available
  const handleProductChange = (product: string) => {
    setSelectedProduct(product);

    // If we have an existing review for this product, load it
    if (existingReviews[product]) {
      setRating(existingReviews[product].rating);
      setReviewText(existingReviews[product].review_text);
    } else {
      // Reset form for new review
      setRating(5);
      setReviewText("");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          loadExistingReviews();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="text-white h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden ml-2"
          onClick={() => {
            // Reset form state when opening dialog
            setSelectedProduct("");
            setRating(5);
            setReviewText("");
          }}
        >
          <span className="relative z-10 transition-colors duration-300">
            <MessageSquare className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400" />
          </span>
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            Share your experience with our products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Product</label>
            <Select value={selectedProduct} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {licenses
                  .filter((license) => !existingReviews[license.product_name])
                  .map((license) => (
                    <SelectItem
                      key={license.product_name}
                      value={license.product_name}
                    >
                      {license.product_name}
                    </SelectItem>
                  ))}
                {Object.keys(existingReviews).length > 0 &&
                  licenses.filter(
                    (license) => !existingReviews[license.product_name],
                  ).length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-gray-500">
                      You've reviewed all your products
                    </div>
                  )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  className={`p-1 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                  onClick={() => setRating(star)}
                >
                  <Star className="h-6 w-6 fill-current" />
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Review</label>
            <Textarea
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-green-400 text-white hover:text-green-400 relative overflow-hidden group"
          >
            <span className="relative z-10 transition-colors duration-300">
              {isSubmitting
                ? "Submitting..."
                : existingReviews[selectedProduct]
                  ? "Update review"
                  : "Submit review"}
            </span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
