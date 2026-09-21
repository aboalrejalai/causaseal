import { PageHeading } from "@/components/causaseal/page-heading"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const TEAM = [
  {
    name: "شادية",
    role: "الفكرة والابتكار",
    initials: "ش",
    focus: "المناعة السببية، X-CFS، SERMG، والرؤية الاستراتيجية لـ SAIF 2026.",
  },
  {
    name: "بشرى",
    role: "الهندسة والنموذج الأولي",
    initials: "ب",
    focus: "بوابة التحليل، واجهة العمليات، والنشر الإنتاجي للنموذج الأولي.",
  },
  {
    name: "محمد أبو الرجال",
    role: "الأنظمة والأمن السيبراني",
    initials: "م",
    focus: "هندسة المنصات المتكاملة، دمج وكلاء الذكاء الاصطناعي، وحلول الأمن السيبراني عالية الضمان.",
  },
]

export default function TeamPage() {
  return (
    <>
      <PageHeading
        eyebrow="TEAM"
        title="فريق العمل"
        description="أدوار الابتكار والهندسة والأنظمة في نموذج CAUSASEAL لـ SAIF 2026."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TEAM.map((member) => (
          <Card key={member.name}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <CardTitle>{member.name}</CardTitle>
                <Badge variant="outline" className="w-fit">
                  {member.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {member.focus}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
