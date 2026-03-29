"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileRedirect() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/users/${encodeURIComponent(username)}`);
  }, [username, router]);

  return null;
}
