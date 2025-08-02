import { toast } from "react-hot-toast";

export function showGlobalError(error: any) {
  console.log("Global error:", error);
  if (Array.isArray(error?.detail)) {
    toast.error(error.detail.map((e: any) => e.msg).join(", "));
  } else {
    toast.error(error?.detail || "An error occurred");
  }
}