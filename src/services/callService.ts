import axiosInstance from "./axiosConfig";

export interface InitiateCallRequest {
  leadId: string;
}

export interface InitiateCallResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Initiate a call to a lead
 */
export const initiateCall = async (
  leadId: string
): Promise<InitiateCallResponse> => {
  try {
    const response = await axiosInstance.post<InitiateCallResponse>(
      "/call/initiate",
      { leadId }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to initiate call"
    );
  }
};
