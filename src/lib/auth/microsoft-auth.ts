import { supabase } from "../../../supabase/supabase";

export async function invokeMicrosoftAuth(code: string) {
  try {
    const { data, error } = await supabase.functions.invoke("microsoft-auth", {
      body: { code },
    });

    if (error) {
      console.error("Error invoking Microsoft auth function:", error);
      throw error;
    }

    return { data, error: null };
  } catch (err) {
    console.error("Exception in invokeMicrosoftAuth:", err);
    return { data: null, error: err };
  }
}
