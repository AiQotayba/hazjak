import { redirect } from "next/navigation";

export default function OwnerStadiumRedirect() {
  redirect("/owner/settings");
}
