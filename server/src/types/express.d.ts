declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string | null }
      profile?: {
        id: string
        is_admin: boolean
        is_banned: boolean
        full_name: string
        username: string
        avatar_url: string | null
        batch: string | null
        current_streak: number
        longest_streak: number
        last_post_date: string | null
        created_at: string
      }
    }
  }
}

export {}
