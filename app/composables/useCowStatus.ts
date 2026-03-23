const STATUS_LABELS: Record<number, string> = {
  0: 'Geen',
  1: 'Kalf',
  2: 'Vaars (kalf)',
  3: 'Vaars',
  4: 'Vers',
  5: 'Vroeg',
  6: 'Geaborteerd',
  7: 'Insemineren',
  8: 'Gust',
  9: 'Geïnsemineerd',
  10: 'Drachtig',
  11: 'Drachtig 2',
  12: 'Droog',
  13: 'Lead',
  14: 'Gebruiker',
  15: 'Niet insemineren',
  16: 'Afstoten'
}

export function useCowStatus() {
  const getLabel = (code: number | string | null | undefined): string => {
    if (code === null || code === undefined) return '—'
    return STATUS_LABELS[Number(code)] ?? String(code)
  }

  return { getLabel, STATUS_LABELS }
}
