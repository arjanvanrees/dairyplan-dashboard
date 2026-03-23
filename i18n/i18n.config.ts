export default defineI18nConfig(() => ({
  legacy: false,
  messages: {
    nl: {
      koe: '{count} koe | {count} koeien'
    }
  },
  numberFormats: {
    nl: {
      currency: {
        style: 'currency', currency: 'EUR', notation: 'standard'
      },
      decimal: {
        style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
      },
      single: {
        style: 'decimal', minimumFractionDigits: 1, maximumFractionDigits: 1
      },
      percent: {
        style: 'percent', useGrouping: false
      }
    }
  }
}))
