"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { decodeData } from "@/lib/transformer";
import { SimpleTemplate, ProfileData } from "@/components/templates/simple";
import { Loading } from "@/components/base/loading";

function ViewerContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (dataParam) {
      const decoded = decodeData(dataParam);
      setData(decoded);
    }
  }, [dataParam]);

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading className="h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  return <SimpleTemplate data={data} />;
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loading className="h-10 w-10 text-indigo-600" />
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}
