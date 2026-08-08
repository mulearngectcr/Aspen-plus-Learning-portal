type OwnPost = {
  id: string
  content: string
  image_url_1: string | null
  image_url_2: string | null
  created_at: string
  post_date: string
}

// This richer post shape is private to /api/me and is never used by the
// public-feed serializer.
export function serializeOwnPost(post: OwnPost) {
  return { id: post.id, content: post.content, image_url_1: post.image_url_1, image_url_2: post.image_url_2, created_at: post.created_at, post_date: post.post_date, is_mine: true }
}
