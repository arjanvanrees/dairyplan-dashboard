export default defineI18nConfig(() => ({
  legacy: false,
  datetimeFormats: {
    nl: {
      short: {
        day: '2-digit', month: '2-digit', year: 'numeric'
      }
    }
  },
  messages: {
    nl: {
      dier: '{count} dier | {count} dieren'
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
