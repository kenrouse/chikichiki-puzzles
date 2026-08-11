export type AppLanguage = 'en' | 'ja'

export function getLocalizedCopy<
  Copy extends Record<AppLanguage, object>,
>(language: AppLanguage, copy: Copy): Copy[AppLanguage] {
  return copy[language]
}