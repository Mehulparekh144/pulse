'use client'
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";

export const useNavigation = () => {
  const params = useSearchParams();
  const [currentPage, setCurrentPage] = useState<string>(params.get('page') ?? 'summary');
  const router = useRouter();

  useEffect(() => {
    const page = params.get('page') ?? 'summary';
    setCurrentPage(page);
  }, [params]);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    router.push(`${window.location.pathname}?page=${page}`);
  }

  return { currentPage, handleNavigation }
};
