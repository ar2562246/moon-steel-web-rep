import HomePage from "@/features/home/HomePage";
import { resolveHomePageData } from "@/features/home/queries";

export default async function Page() {
  const data = await resolveHomePageData();

  return <HomePage data={data} />;
}
