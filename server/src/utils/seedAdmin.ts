import bcrypt from 'bcryptjs'
import { User } from '../models/User'

export async function seedAdmin(email: string, password: string) {
  if (!email || !password) return
  const existing = await User.findOne({ email })
  if (existing) return
  const passwordHash = await bcrypt.hash(password, 10)
  await User.create({ email, passwordHash, firstName: 'System', lastName: 'Administrator', role: 'admin' })
  console.log(`[seed] Created admin user: ${email}`)
}
