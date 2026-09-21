"use client"

import Link from "next/link"
import * as React from "react"

import { IllustrativeBadge, PageHeading } from "@/components/causaseal/page-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { fetchFingerprints } from "@/lib/api/client"
import type { Fingerprint } from "@/lib/contracts"
import { SEED_FINGERPRINTS } from "@/lib/seed-data"

export function MemoryView() {
  const [fingerprints, setFingerprints] = React.useState<Fingerprint[]>(SEED_FINGERPRINTS)
  const [selected, setSelected] = React.useState<Fingerprint | null>(null)

  React.useEffect(() => {
    let cancelled = false
    void fetchFingerprints()
      .then((data) => {
        if (!cancelled) setFingerprints(data.fingerprints)
      })
      .catch(() => {
        if (!cancelled) setFingerprints(SEED_FINGERPRINTS)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <PageHeading
        eyebrow="CAUSAL MEMORY"
        title="ذاكرة X-CFS"
        description="بصمات سببية قابلة لإعادة الاستخدام عبر السياقات المختلفة."
        actions={
          <>
            <IllustrativeBadge />
            <Button asChild>
              <Link href="/investigate">إنشاء بصمة</Link>
            </Button>
          </>
        }
      />

      {fingerprints.length === 0 ? (
        <Empty className="border border-dashed py-16">
          <EmptyHeader>
            <EmptyTitle>لا توجد بصمات بعد</EmptyTitle>
            <EmptyDescription>أنشئ بصمة من صفحة التحليل السببي.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fingerprints.map((fp) => (
            <Card key={fp.id} className="flex h-full flex-col gap-4 py-4">
              <CardHeader className="px-4 pb-0">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{fp.id}</Badge>
                  <time className="text-xs text-muted-foreground">{fp.date}</time>
                </div>
                <CardTitle className="line-clamp-2 text-base">{fp.title}</CardTitle>
                <CardDescription className="line-clamp-3">{fp.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5 px-4">
                {(fp.invariants?.length ? fp.invariants : fp.tags).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t px-4 pt-4">
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="text-muted-foreground">مطابقات</span>
                  <strong className="text-sm">{fp.matches}</strong>
                </div>
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="text-muted-foreground">الثقة</span>
                  <strong className="text-sm">{fp.confidence}</strong>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelected(fp)}>
                  التفاصيل
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="flex flex-col gap-4 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selected?.id}</SheetTitle>
            <SheetDescription>{selected?.title}</SheetDescription>
          </SheetHeader>
          {selected ? (
            <div className="flex flex-col gap-4 px-1">
              <p className="text-sm text-muted-foreground">{selected.desc}</p>
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">الثوابت السببية</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.invariants?.length ? selected.invariants : selected.tags).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">المطابقات</p>
                  <p className="font-semibold">{selected.matches}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">الثقة</p>
                  <p className="font-semibold">{selected.confidence}</p>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
