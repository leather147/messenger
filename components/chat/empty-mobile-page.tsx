import type { LucideIcon } from "lucide-react"

interface EmptyMobilePageProps {
  title: string
  description: string
  icon: LucideIcon
}

export function EmptyMobilePage({ title, description, icon: Icon }: EmptyMobilePageProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-8 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-accent md:size-20">
          <Icon className="size-8 text-primary md:size-10" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
