/**
 * Request body for generating a token
 */
export interface TokenRequest {
    /** The username for authentication */
    clientId: string;
    clientSecret: string;
}

/**
 * Response from token generation
 */
export interface TokenResponse {
    /** The generated JWT token */
    token: string;
    /** When the token expires */
    expiresAt: string;
}
