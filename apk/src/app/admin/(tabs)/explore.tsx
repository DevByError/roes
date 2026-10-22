import { router } from "expo-router";
import { ExploreScreen } from "@/features/explore/ExploreScreen";

export default function Explore() {
  return <ExploreScreen ownAction={{ label: "Manage in my Rules", onPress: () => router.navigate("/admin/rules") }} />;
}
