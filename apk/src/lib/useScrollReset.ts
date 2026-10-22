import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "expo-router";

export function useScrollReset() {
  const nav = useNavigation();
  const route = useRoute();
  const [k, setK] = useState(0);
  useEffect(() => {
    return nav.addListener("blur", () => {
      const st = nav.getState();
      if (st?.routes?.[st.index]?.key !== route.key) setK((n) => n + 1);
    });
  }, [nav, route.key]);
  return k;
}
