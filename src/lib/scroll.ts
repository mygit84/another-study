export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
}
