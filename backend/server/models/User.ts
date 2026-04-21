import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  username: string
  password: string
  name: string
  role: 'admin' | 'supervisor' | 'officer'
  rank: string
  badge: string
  firstAccess: boolean
  active: boolean
  comparePassword(password: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'supervisor', 'officer'], default: 'officer' },
    rank: { type: String, default: '' },
    badge: { type: String, default: '' },
    firstAccess: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password)
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
