"use client";
import { Suspense, useState, useEffect } from "react";
import SnowScene from "./components/SnowScene";
import Loading from "./components/Loading";

export default function Home() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 3000); // Show loading for at least 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <SnowScene />
    </Suspense>
  );
}
