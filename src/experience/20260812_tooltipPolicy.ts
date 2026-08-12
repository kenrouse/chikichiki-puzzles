export interface TooltipTextInput {
  accessibleName: string
  explicitText: string
  iconOnly: boolean
  title: string
}

export function resolveTooltipText({
  accessibleName,
  explicitText,
  iconOnly,
  title,
}: TooltipTextInput): string {
  if (explicitText) return explicitText
  if (title) return title
  return iconOnly ? accessibleName : ''
}