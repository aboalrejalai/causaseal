"use client"

import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { PageHeading } from "@/components/causaseal/page-heading"
import { useLanguage } from "@/components/causaseal/language-provider"
import { Button } from "@/components/ui/button"

export function ConnectorBackLink() {
  const { language } = useLanguage()
  const ar = language === "ar"
  return (
    <Button asChild variant="ghost" size="sm" className="mb-2 -ms-2 w-fit">
      <Link href="/connectors">
        <ChevronRightIcon className="size-4 rtl:rotate-180" />
        {ar ? "الموصّلات" : "Connectors"}
      </Link>
    </Button>
  )
}

export function ConnectorPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <>
      <ConnectorBackLink />
      <PageHeading eyebrow={eyebrow} title={title} description={description} />
      {children}
    </>
  )
}
