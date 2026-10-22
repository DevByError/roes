import { Redirect } from "expo-router";
import { useMe } from "@/lib/store";

export default function Index() {
  const me = useMe();
  if (!me) return <Redirect href="/login" />;
  return <Redirect href={me.role === "admin" ? "/admin/home" : "/user"} />;
}
