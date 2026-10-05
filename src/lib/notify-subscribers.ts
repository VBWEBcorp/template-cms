import { Subscriber } from '@/models/Newsletter'
import { sendBlogNotification } from '@/lib/email'

/**
 * Envoie (une seule fois) l'annonce d'un article aux abonnés actifs, uniquement
 * lors du passage en publié. Best-effort : n'interrompt jamais la sauvegarde.
 *
 * @param post           document Mongoose de l'article (après sauvegarde)
 * @param wasPublished   l'article était-il déjà publié AVANT cette opération ?
 */
type PostToNotify = {
  title: string
  excerpt?: string
  slug: string
  coverImage?: string
  published?: boolean
  publishedAt?: Date
  notifyOnPublish?: boolean
  newsletterSentAt?: Date
  save: () => Promise<unknown>
}

export async function notifyNewPost(post: PostToNotify | null, wasPublished: boolean): Promise<void> {
  try {
    if (!post) return
    if (wasPublished) return                 // déjà publié → pas une nouvelle mise en ligne
    if (!post.published) return              // toujours en brouillon
    if (post.notifyOnPublish === false) return // case décochée par l'admin
    if (post.newsletterSentAt) return        // garde-fou : déjà notifié

    // Article planifié dans le futur : pas encore en ligne → on n'annonce pas
    const publishedAtMs = post.publishedAt ? new Date(post.publishedAt).getTime() : Date.now()
    if (publishedAtMs > Date.now()) return

    const subs = await Subscriber.find({ status: { $ne: 'unsubscribed' } }).select('email').lean()
    const emails = (subs as Array<{ email: string }>).map((s) => s.email)
    if (emails.length === 0) return

    const result = await sendBlogNotification(emails, {
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      coverImage: post.coverImage,
    })

    // On marque dès qu'un envoi a été tenté (Resend configuré), pour ne pas
    // ré-annoncer le même article à la prochaine modification.
    if (result.configured) {
      post.newsletterSentAt = new Date()
      await post.save()
    }
  } catch (err) {
    console.error('notifyNewPost error:', err)
  }
}
