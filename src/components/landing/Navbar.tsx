import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X, Loader2 } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "../../../supabase/supabase";

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

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { user, signOut, isAdmin, refreshSession } = useAuth();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching products:", error);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error("Error in fetchProducts:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Refresh session when component mounts to ensure auth state is current
  useEffect(() => {
    const checkSession = async () => {
      // Check if we have a stored session flag
      const hasStoredSession =
        localStorage.getItem("auth_session_active") === "true";
      console.log("Navbar: Checking stored session flag:", hasStoredSession);

      // Always refresh session on navbar mount to ensure UI is in sync
      console.log("Navbar: Refreshing session on mount");
      await refreshSession();
    };

    checkSession();

    // Set up an interval to periodically check the session
    const intervalId = setInterval(() => {
      refreshSession().catch((err) =>
        console.error("Error refreshing session in interval:", err),
      );
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [refreshSession]);

  // Function to scroll to element with navbar offset
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element && headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      // Add a 75px gap between navbar and the title
      const offsetPosition = elementPosition - headerHeight - 75;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Function to generate card ID from product name
  const getCardIdFromProductName = (name: string): string => {
    return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-card`;
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-gray-900/95 backdrop-blur-sm shadow-md" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center"
            onClick={() => {
              // Ensure session persistence when clicking the logo
              if (user) {
                localStorage.setItem("auth_session_active", "true");
                console.log("Logo clicked: Reinforced session persistence");
              }
              // Scroll to top of page
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <span className="text-xl font-bold text-white">
              Craftology <span className="text-green-400">Inc.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-white hover:text-green-400 transition-colors"
              onClick={() => {
                // Ensure session persistence when clicking home
                if (user) {
                  localStorage.setItem("auth_session_active", "true");
                  console.log("Home clicked: Reinforced session persistence");
                }
                // Scroll to top of page
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center text-white hover:text-green-400 transition-colors">
                  Products <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-400 mr-2" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <DropdownMenuItem
                      key={product.id}
                      className="hover:bg-green-400 hover:text-white focus:bg-green-400 focus:text-white"
                    >
                      <Link
                        to="/#products-section"
                        className="w-full text-green-400 hover:text-white group-hover:text-white"
                        onClick={() => {
                          scrollToElement(
                            getCardIdFromProductName(product.name),
                          );
                        }}
                      >
                        {product.name.toLowerCase()}
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-500 text-sm">
                    No products available
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:text-green-400 hover:bg-gray-800"
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="hover:bg-green-400 hover:text-white focus:bg-green-400 focus:text-white">
                    <Link
                      to="/dashboard"
                      className="w-full text-green-400 hover:text-white group-hover:text-white"
                    >
                      dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className="hover:bg-green-400 hover:text-white focus:bg-green-400 focus:text-white">
                      <Link
                        to="/admin"
                        className="w-full text-green-400 hover:text-white group-hover:text-white"
                      >
                        admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onSelect={() => signOut()}
                    className="text-green-400 hover:text-white hover:bg-green-400 focus:bg-green-400 focus:text-white"
                  >
                    sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-green-400 hover:bg-white relative overflow-hidden group"
                  >
                    <span className="relative z-10 transition-colors duration-300">
                      Sign in
                    </span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-green-400 text-white hover:text-green-400 relative overflow-hidden group">
                    <span className="relative z-10 transition-colors duration-300">
                      Sign up
                    </span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              to="/"
              className="block text-white hover:text-green-400 transition-colors py-2"
              onClick={() => {
                setIsMobileMenuOpen(false);
                // Ensure session persistence when clicking home in mobile menu
                if (user) {
                  localStorage.setItem("auth_session_active", "true");
                  console.log("Home clicked: Reinforced session persistence");
                }
                // Scroll to top of page
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              Home
            </Link>

            <div className="py-2">
              <div className="flex items-center text-white mb-2">Products</div>
              <div className="pl-4 space-y-2">
                {isLoadingProducts ? (
                  <div className="flex items-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      Loading products...
                    </span>
                  </div>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <Link
                      key={product.id}
                      to="/#products-section"
                      className="block text-gray-300 hover:text-green-400 transition-colors py-1"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setTimeout(
                          () =>
                            scrollToElement(
                              getCardIdFromProductName(product.name),
                            ),
                          100,
                        );
                      }}
                    >
                      {product.name.toLowerCase()}
                    </Link>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm py-1">
                    No products available
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-white hover:text-green-400 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block text-white hover:text-green-400 transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      admin
                    </Link>
                  )}
                  <button
                    className="block text-white hover:text-green-400 transition-colors py-2"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full text-white hover:text-green-400 hover:bg-white relative overflow-hidden group"
                    >
                      <span className="relative z-10 transition-colors duration-300">
                        Sign in
                      </span>
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-green-400 text-white hover:text-green-400 relative overflow-hidden group">
                      <span className="relative z-10 transition-colors duration-300">
                        Sign up
                      </span>
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
