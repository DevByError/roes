import { TAB_SPACE } from "@/features/admin/TabBar";
import { ProfileView } from "@/features/profile/ProfileView";

export default function Me() {
  return <ProfileView bottomSpace={TAB_SPACE + 20} />;
}
