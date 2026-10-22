import { router } from "expo-router";
import { ExploreScreen } from "@/features/explore/ExploreScreen";

export default function Explore() {
  return <ExploreScreen ownAction={{ label: "My residence rules", onPress: () => router.navigate({ pathname: "/user/community", params: { tab: "rules" } }) }} />;
}
