import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabase/supabase";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import TextAnimation from "./animations/TextAnimation";

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  company: string;
  avatarSeed: string;
  rating?: number;
}

const Testimonial: React.FC<TestimonialProps> = ({
  content,
  author,
  role,
  company,
  avatarSeed,
  rating = 5,
}) => {
  return (
    <Card className="h-full">
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
  );
};

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialProps[]>([]);
  const realtimeSubscriptionRef = useRef<RealtimeChannel | null>(null);

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
            () => {
              console.log("Reviews table changed, fetching updated data");
              fetchReviews();
            },
          )
          .subscribe();
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

          // Only use user reviews, no default testimonials
          setTestimonials(userReviews);
        }
      } catch (error) {
        console.error("Error in fetchReviews:", error);
        // Set default testimonials if there's an error
        setTestimonials([
          {
            content:
              "The automation tools have saved me countless hours of manual work. Highly recommended!",
            author: "Alex Johnson",
            role: "Developer",
            company: "Autovoter",
            avatarSeed: "alex",
            rating: 5,
          },
          {
            content:
              "Excellent product with great support. The factionsbot has been a game-changer for our team.",
            author: "Sarah Miller",
            role: "Team Lead",
            company: "Factionsbot 1.18.2",
            avatarSeed: "sarah",
            rating: 5,
          },
          {
            content:
              "The captcha solver works flawlessly. It's been incredibly reliable and accurate.",
            author: "Michael Chen",
            role: "Software Engineer",
            company: "EMC captcha solver",
            avatarSeed: "michael",
            rating: 5,
          },
        ]);
        // Don't try to set up realtime subscription if the initial fetch failed
        return;
      }
    };

    fetchReviews();
    try {
      setupRealtimeSubscription();
    } catch (error) {
      console.error("Failed to setup realtime subscription:", error);
    }

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
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Testimonial
                  content={testimonial.content}
                  author={testimonial.author}
                  role={testimonial.role}
                  company={testimonial.company}
                  avatarSeed={testimonial.avatarSeed}
                  rating={testimonial.rating}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
