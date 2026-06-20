import { StadiumsPageContent } from "@/features/stadium/components/stadiums-page-content";

export default function UserStadiumsPage() {
  return (
    <StadiumsPageContent
      basePath="/user/stadiums"
      title="الملاعب"
      description="تصفّح الملاعب واحجز من حسابك مباشرة"
    />
  );
}
