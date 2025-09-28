import mongoose from 'mongoose'
import { env } from './env'

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI)
    console.log('[db] connected')
  } catch (err) {
    console.error('[db] connection error:', err)
    throw err
  }
}
