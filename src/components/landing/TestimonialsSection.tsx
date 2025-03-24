import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabase/supabase";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useAnimationControls,
} from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import TextAnimation from "./animations/TextAnimation";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  company: string;
  avatarSeed: string;
  rating?: number;
}

const Testimonial: React.FC<
  TestimonialProps & { onDragEnd?: (info: any) => void }
> = ({ content, author, role, company, avatarSeed, rating = 5, onDragEnd }) => {
  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springRotate = useSpring(rotate, springConfig);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{
        x: springX,
        rotate: springRotate,
        cursor: "grab",
      }}
      whileTap={{ cursor: "grabbing" }}
      whileHover={{ scale: 1.03 }}
      onDragEnd={(_, info) => {
        if (onDragEnd) onDragEnd(info);
        controls.start({
          x: 0,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        });
      }}
      className="h-full w-full px-2 snap-center"
    >
      <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < (rating || 5) ? "text-green-400 fill-green-400" : "text-gray-300 fill-gray-300"}`}
              />
            ))}
          </div>
          <p className="text-gray-700 mb-6">"{content}"</p>
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt={author}
              />
              <AvatarFallback>{author[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{author}</h4>
              <p className="text-sm text-gray-600">
                {role}, {company}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialProps[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const realtimeSubscriptionRef = useRef<RealtimeChannel | null>(null);

  // Responsive breakpoints
  const isSmall = useMediaQuery("(max-width: 640px)");
  const isMedium = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  // Calculate how many items to show based on screen size
  const itemsToShow = isSmall ? 1 : isMedium ? 2 : 3;
  const maxIndex = Math.max(0, testimonials.length - itemsToShow);

  useEffect(() => {
    // Set up realtime subscription
    const setupRealtimeSubscription = () => {
      try {
        // Clean up any existing subscription
        if (realtimeSubscriptionRef.current) {
          realtimeSubscriptionRef.current.unsubscribe();
        }

        // Subscribe to changes on the reviews table
        realtimeSubscriptionRef.current = supabase
          .channel("reviews-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "reviews" },
            (payload) => {
              console.log("Reviews table changed, payload:", payload);
              console.log("Fetching updated reviews data");
              fetchReviews();
            },
          )
          .subscribe((status) => {
            console.log("Reviews realtime subscription status:", status);
          });
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        console.log("Fetching reviews...");
        const { data: reviews, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching reviews:", error);
          return;
        }

        console.log("Fetched reviews:", reviews);

        if (reviews?.length) {
          // Create testimonials from reviews
          const userReviews = reviews.map((review) => ({
            content: review.review_text,
            author: "Verified user",
            role: "Verified customer",
            company: review.product_name,
            avatarSeed: review.user_id,
            rating: review.rating,
          }));

          console.log(
            "Setting testimonials with user reviews:",
            userReviews.length,
          );
          // Only use user reviews, no default testimonials
          setTestimonials([...userReviews]); // Use spread operator to ensure state update
        } else {
          console.log("No reviews found, setting empty testimonials");
          // Set empty testimonials if no reviews found
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error in fetchReviews:", error);
        // Set empty testimonials if there's an error
        setTestimonials([]);
        // Still try to set up realtime subscription even if initial fetch failed
        setupRealtimeSubscription();
      }
    };

    // Fetch reviews immediately
    fetchReviews();

    // Set up realtime subscription with a slight delay to ensure it's set up properly
    setTimeout(() => {
      try {
        console.log("Setting up realtime subscription for reviews");
        setupRealtimeSubscription();
      } catch (error) {
        console.error("Failed to setup realtime subscription:", error);
      }
    }, 1000);

    // Cleanup subscription when component unmounts
    return () => {
      try {
        if (realtimeSubscriptionRef.current) {
          realtimeSubscriptionRef.current.unsubscribe();
        }
      } catch (error) {
        console.error("Error unsubscribing from realtime:", error);
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Handle navigation
  const handlePrev = () => {
    if (currentIndex > 0 && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex(currentIndex - 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  // Handle drag end
  const handleDragEnd = (info: any) => {
    const threshold = 100; // minimum distance to trigger a slide

    if (info.offset.x > threshold && currentIndex > 0) {
      handlePrev();
    } else if (info.offset.x < -threshold && currentIndex < maxIndex) {
      handleNext();
    }
  };

  // Scroll to current index when it changes
  useEffect(() => {
    if (carouselRef.current) {
      const scrollAmount =
        currentIndex * (carouselRef.current.scrollWidth / testimonials.length);
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  }, [currentIndex, testimonials.length]);

  return (
    <section className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="text-green-400 block">
              <TextAnimation text="What" type="letter" isGreen={true} />
            </span>
            <span className="block">
              <TextAnimation text="our" type="letter" />
            </span>
            <span className="text-green-400 block">
              <TextAnimation text="clients" type="letter" isGreen={true} />
            </span>
            <span className="block">
              <TextAnimation text="say" type="letter" />
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from some of our satisfied
            customers
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                ref={carouselRef}
                className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide scroll-smooth"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`flex-none w-full sm:w-1/2 lg:w-1/3 transition-all duration-300`}
                  >
                    <Testimonial
                      content={testimonial.content}
                      author={testimonial.author}
                      role={testimonial.role}
                      company={testimonial.company}
                      avatarSeed={testimonial.avatarSeed}
                      rating={testimonial.rating}
                      onDragEnd={handleDragEnd}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Navigation buttons */}
            {testimonials.length > itemsToShow && (
              <div className="flex justify-between w-full absolute top-1/2 transform -translate-y-1/2 px-4 z-10">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0 || isAnimating}
                  className={`p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-6 w-6 text-green-400" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex || isAnimating}
                  className={`p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors ${currentIndex >= maxIndex ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-6 w-6 text-green-400" />
                </button>
              </div>
            )}

            {/* Pagination dots */}
            {testimonials.length > itemsToShow && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isAnimating) {
                        setIsAnimating(true);
                        setCurrentIndex(index);
                        setTimeout(() => setIsAnimating(false), 500);
                      }
                    }}
                    className={`h-2 w-2 rounded-full transition-all ${currentIndex === index ? "bg-green-400 w-4" : "bg-gray-300"}`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Instructions for users */}
            <div className="text-center mt-6 text-sm text-gray-500">
              <p>Drag a testimonial to spin through reviews</p>
            </div>
          </div>
        ) : (
          <div className="col-span-3 text-center py-12">
            <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No reviews available
            </h3>
            <p className="text-gray-500">
              Reviews will appear here once customers share their experiences.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
