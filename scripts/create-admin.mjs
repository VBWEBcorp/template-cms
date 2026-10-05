/**
 * Crée (ou met à jour) un compte admin en base, pour un second accès en plus
 * de ADMIN_EMAIL / ADMIN_PASSWORD.
 *
 *   node scripts/create-admin.mjs prenom@domaine.fr "mot de passe solide" "Prénom"
 *
 * Lit MONGODB_URI dans .env.local. Ne jamais lancer contre une base de
 * production depuis un poste de développement sans l'avoir décidé.
 */
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

try {
  process.loadEnvFile('.env.local')
} catch {
  // pas de .env.local : on compte sur les variables du shell
}

const [email, password, name = 'Admin'] = process.argv.slice(2)
if (!email || !password || password.length < 10) {
  console.error('Usage : node scripts/create-admin.mjs <email> "<mot de passe de 10 caractères minimum>" [nom]')
  process.exit(1)
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI absent (.env.local).')
  process.exit(1)
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
)
const User = mongoose.models.User || mongoose.model('User', UserSchema)

await mongoose.connect(process.env.MONGODB_URI)
const hash = await bcrypt.hash(password, 10)
await User.updateOne(
  { email: email.toLowerCase() },
  { $set: { password: hash, name, role: 'admin' } },
  { upsert: true }
)
console.log(`Compte admin prêt : ${email.toLowerCase()}`)
await mongoose.disconnect()
