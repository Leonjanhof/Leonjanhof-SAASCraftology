/**
 * Utility functions for token verification across edge functions
 */

/**
 * Verifies a license token
 * @param token Base64 encoded token string
 * @returns Decoded token data if valid, null if invalid
 */
export function verifyToken(token: string): TokenData | null {
  try {
    // Decode the base64 token
    const decodedToken = JSON.parse(atob(token));

    // Check if token has expired
    if (!decodedToken.exp || decodedToken.exp < Math.floor(Date.now() / 1000)) {
      console.log("Token has expired");
      return null;
    }

    // Validate token structure
    if (!decodedToken.license_id || !decodedToken.product_name) {
      console.log("Token is missing required fields");
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Token data structure
 */
export interface TokenData {
  license_id: string;
  product_name: string;
  user_id: string;
  exp: number;
}

/**
 * Extracts token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null if invalid
 */
export function extractTokenFromHeader(
  authHeader: string | null,
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Middleware-style function to verify a token from request headers
 * @param req Request object
 * @returns TokenData if valid, null if invalid
 */
export async function verifyRequestToken(
  req: Request,
): Promise<TokenData | null> {
  const authHeader = req.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
