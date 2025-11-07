import { parseBillComData, BillComData } from './billComParser'

// Load Bill.com data from CSV files
export async function loadBillComData(): Promise<BillComData | null> {
  try {
    // Load both vendor and bills CSV files
    const [vendorsResponse, billsResponse] = await Promise.all([
      fetch('/bill-com-vendors.csv'),
      fetch('/bill-com-bills.csv')
    ])

    if (!vendorsResponse.ok || !billsResponse.ok) {
      console.warn('Bill.com data files not found')
      return null
    }

    const [vendorsCSV, billsCSV] = await Promise.all([
      vendorsResponse.text(),
      billsResponse.text()
    ])

    return parseBillComData(vendorsCSV, billsCSV)
  } catch (error) {
    console.error('Error loading Bill.com data:', error)
    return null
  }
}
