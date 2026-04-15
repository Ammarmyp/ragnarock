/**
 * Authentication API Service
 * All authentication-related API calls
 */

import apiClient from "./client";
import { AUTH_ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "@/types";

/**
 * Auth Types
 */
export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  subscribeNewsletter?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "user" | "viewer";
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

/**
 * Sign up a new user
 * @param data - User registration data
 * @returns Authentication response with user and token
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.REGISTER,
    data,
  );
  return response.data.data;
}

/**
 * Sign in an existing user
 * @param data - User credentials
 * @returns Authentication response with user and token
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.LOGIN,
    data,
  );
  return response.data.data;
}

/**
 * Sign out the current user
 * @returns Success status
 */
export async function signOut(): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
}

/**
 * Verify email with OTP
 * @param data - Email and OTP code
 * @returns Authentication response
 */
export async function verifyOtp(data: VerifyOtpData): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.VERIFY_EMAIL,
    data,
  );
  return response.data.data;
}

/**
 * Resend OTP to email
 * @param email - User email address
 * @returns Success status
 */
export async function resendOtp(email: string): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { email, resend: true });
}

/**
 * Request password reset
 * @param data - User email
 * @returns Success status
 */
export async function forgotPassword(
  data: ForgotPasswordData,
): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
}

/**
 * Reset password with token
 * @param data - Reset token and new password
 * @returns Success status
 */
export async function resetPassword(data: ResetPasswordData): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
}

/**
 * Get current authenticated user
 * @returns Current user data
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<ApiResponse<AuthUser>>(
    AUTH_ENDPOINTS.ME,
  );
  return response.data.data;
}

/**
 * Refresh authentication token
 * @param refreshToken - Refresh token
 * @returns New authentication tokens
 */
export async function refreshToken(
  refreshToken: string,
): Promise<{ token: string; refreshToken: string }> {
  const response = await apiClient.post<
    ApiResponse<{ token: string; refreshToken: string }>
  >(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  return response.data.data;
}

/**
 * Update user profile
 * @param data - Profile update data
 * @returns Updated user
 */
export async function updateProfile(data: {
  name?: string;
  avatar?: string;
}): Promise<AuthUser> {
  const response = await apiClient.patch<ApiResponse<AuthUser>>(
    AUTH_ENDPOINTS.ME,
    data,
  );
  return response.data.data;
}

/**
 * Change user password
 * @param data - Current and new password
 * @returns Success status
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
}
