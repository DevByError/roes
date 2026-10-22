import { FloatingBar, type BarProps } from "@/features/admin/TabBar";
import { useUserCtx } from "./data";

export function UserTabBar(props: BarProps) {
  const { unseen, helpBadge } = useUserCtx();
  return <FloatingBar {...props} badges={{ community: unseen, help: helpBadge }} />;
}
