import { supabase } from "../supabase";
import { UserData } from "./types";

// Function to fetch user data from the database
export const fetchUserData = async (
  userId: string,
): Promise<UserData | null> => {
  try {
    // First, get user role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role_name")
      .eq("user_id", userId)
      .single();

    if (roleError && roleError.code !== "PGRST116") {
      console.error("Error fetching user role:", roleError);
    }

    // Then get user details
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return null;
    }

    return {
      id: userId,
      email: userData.email || "",
      full_name: userData.full_name || "",
      role: (roleData?.role_name as UserData["role"]) || "user",
      permissions: [
        "access_dashboard",
        "manage_own_licenses",
        "update_profile",
      ],
    };
  } catch (error) {
    console.error("Error in fetchUserData:", error);
    return null;
  }
};

// Helper function to create a user record in the database
export const createUserRecord = async (
  userId: string,
  email: string | undefined,
  fullName: string,
  avatarUrl?: string,
) => {
  try {
    // First check if user already exists to avoid duplicate errors
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking if user exists:", checkError);
    }

    // Only create user if they don't already exist
    if (!existingUser) {
      console.log("Creating new user record in database");
      // Create user record only - role will be created by trigger
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email: email,
        full_name: fullName,
        token_identifier: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_url: avatarUrl,
      });

      if (insertError) {
        console.error("Error creating user record:", insertError);

        // Try a second time with a delay in case of race condition
        setTimeout(async () => {
          try {
            const { error: retryError } = await supabase.from("users").insert({
              id: userId,
              email: email,
              full_name: fullName,
              token_identifier: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              avatar_url: avatarUrl,
            });

            if (retryError) {
              console.error("Retry error creating user record:", retryError);
            } else {
              console.log("User record created successfully on retry");
            }
          } catch (retryErr) {
            console.error("Exception in retry user creation:", retryErr);
          }
        }, 1000);
      } else {
        console.log("User record created successfully");
      }

      // Manually create user role since trigger might not fire
      try {
        console.log("Manually creating user role for new user");
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: userId,
          role_name: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (roleError) {
          console.error("Error manually creating user role:", roleError);
        } else {
          console.log("User role created successfully");
        }
      } catch (roleErr) {
        console.error("Exception in manual user role creation:", roleErr);
      }
    } else {
      console.log("User already exists in database, checking for user role");

      // Check if user role exists
      const { data: existingRole, error: roleCheckError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleCheckError) {
        console.error("Error checking if user role exists:", roleCheckError);
      }

      // Create user role if it doesn't exist
      if (!existingRole) {
        console.log("User role doesn't exist, creating it manually");
        try {
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: userId,
              role_name: "user",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (roleError) {
            console.error("Error manually creating user role:", roleError);
          } else {
            console.log("User role created successfully");
          }
        } catch (roleErr) {
          console.error("Exception in manual user role creation:", roleErr);
        }
      } else {
        console.log("User role already exists, skipping creation");
      }
    }
  } catch (error) {
    console.error("Error in createUserRecord:", error);
    throw error;
  }
};
