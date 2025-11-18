import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AlertType = "success" | "error" | "info";

interface AlertState {
  isVisible: boolean;
  message: string;
  type: AlertType;
}

const initialState: AlertState = {
  isVisible: false,
  message: "",
  type: "info",
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    showAlert: (
      state,
      action: PayloadAction<{ message: string; type?: AlertType }>
    ) => {
      state.isVisible = true;
      state.message = action.payload.message;
      state.type = action.payload.type || "info";
    },
    hideAlert: (state) => {
      state.isVisible = false;
      state.message = "";
      state.type = "info";
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;

export default alertSlice.reducer;
