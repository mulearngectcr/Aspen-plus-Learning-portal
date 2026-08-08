type PostForResponse = {
  id: string
  content: string
  image_url_1: string | null
  image_url_2: string | null
  created_at: string
  post_date: string
  like_count?: number | string
  comment_count?: number | string
  liked_by_me?: boolean
  is_mine: boolean
}

// The single outward-facing post shape. Identity fields are deliberately not
// represented here, so every post route must omit them by construction.
export function serializePost(post: PostForResponse) {
  return {
    id: post.id,
    content: post.content,
    image_url_1: post.image_url_1,
    image_url_2: post.image_url_2,
    created_at: post.created_at,
    post_date: post.post_date,
    like_count: Number(post.like_count ?? 0),
    comment_count: Number(post.comment_count ?? 0),
    liked_by_me: Boolean(post.liked_by_me),
    is_mine: post.is_mine,
  }
}

export type FeedPost = ReturnType<typeof serializePost>
