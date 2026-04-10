import '../models'
import { createPricesAndAreas } from '../services/insert'

const run = async () => {
  try {
    const res = await createPricesAndAreas()
    console.log('seedPricesAreas:', res)
    process.exit(0)
  } catch (err) {
    console.error('seedPricesAreas error:', err)
    process.exit(1)
  }
}

run()
