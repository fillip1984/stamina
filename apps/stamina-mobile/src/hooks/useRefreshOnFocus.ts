import React from "react";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Custom hook to refresh on navigation
 *
 * In some situations, you may want to refetch the query when a React Native Screen is focused again.
 * This custom hook will call the provided refetch function when the screen is focused again.
 * See: https://tanstack.com/query/v5/docs/framework/react/react-native
 */

export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
  const firstTimeRef = React.useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      void refetch();
    }, [refetch]),
  );
}
