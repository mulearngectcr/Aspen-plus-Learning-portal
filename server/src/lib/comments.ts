type CommentRow = {
  id: string
  post_id: string
  parent_comment_id: string | null
  content: string | null
  created_at: string
  is_deleted: boolean
  depth: number
  is_mine: boolean
  can_delete: boolean
}

export type CommentResponse = {
  id: string
  post_id: string
  parent_comment_id: string | null
  content: string | null
  created_at: string
  is_deleted: boolean
  depth: number
  is_mine: boolean
  can_delete: boolean
  replies: CommentResponse[]
}

// No author columns are allowed in this explicit API response type.
export function serializeComment(row: CommentRow): CommentResponse {
  return {
    id: row.id,
    post_id: row.post_id,
    parent_comment_id: row.parent_comment_id,
    content: row.content,
    created_at: row.created_at,
    is_deleted: row.is_deleted,
    depth: Number(row.depth),
    is_mine: Boolean(row.is_mine),
    can_delete: Boolean(row.can_delete),
    replies: [],
  }
}

export function buildCommentTree(rows: CommentRow[]): CommentResponse[] {
  const comments = new Map(rows.map((row) => [row.id, serializeComment(row)]))
  const roots: CommentResponse[] = []
  for (const comment of comments.values()) {
    const parent = comment.parent_comment_id ? comments.get(comment.parent_comment_id) : null
    if (parent) parent.replies.push(comment)
    else roots.push(comment)
  }
  const sort = (items: CommentResponse[]) => {
    items.sort((a, b) => a.created_at.localeCompare(b.created_at))
    items.forEach((item) => sort(item.replies))
  }
  sort(roots)
  return roots
}
