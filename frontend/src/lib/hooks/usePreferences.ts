import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";

export function usePreferences() {
  return useQuery({
    queryKey: ["preferences"],
    queryFn: async () => {
      const res = await api.get("/users/me/preferences");
      // Convert array to object for easier access
      const prefs: Record<string, string> = {};
      res.data.forEach((p: { key: string; value: string }) => {
        prefs[p.key] = p.value;
      });
      return prefs;
    },
  });
}

export function useSetPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const res = await api.put(`/users/me/preferences/${key}`, { key, value });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });
}