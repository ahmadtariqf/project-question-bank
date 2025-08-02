import { toast } from "react-hot-toast";

export function showGlobalSuccess(message: string) {
  console.log("Global Success:", message);
  toast.success(message);
}