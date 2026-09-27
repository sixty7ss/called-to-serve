export function formatMissionDates(startDate, endDate) {
  if (!startDate || !endDate) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  })

  const start = new Date(`${startDate}T00:00:00`)

  const end = new Date(`${endDate}T00:00:00`)

  return `${formatter.format(start)} – ${formatter.format(end)}`
}
