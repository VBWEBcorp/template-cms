import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  name?: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
)

// Mot de passe haché à l'enregistrement (middleware asynchrone de Mongoose 9).
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
