import { InvestigateView } from "@/components/causaseal/investigate-view"
import { PageHeading } from "@/components/causaseal/page-heading"
import { Badge } from "@/components/ui/badge"

export default function InvestigatePage() {
  return (
    <>
      <PageHeading
        eyebrow="CAUSAL RECONSTRUCTION"
        title="تحليل حادث جديد"
        description="أدخل سيناريو الوكيل لبناء المسار السببي واختباره."
        actions={<Badge variant="info">MVP قابل للاختبار</Badge>}
      />
      <InvestigateView />
    </>
  )
}
