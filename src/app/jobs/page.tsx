import { auth } from "@/auth";
import { redirect } from "next/navigation";
import JobSearchClient from "./JobSearchClient";

export default async function JobSearchPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <JobSearchClient />;
}
