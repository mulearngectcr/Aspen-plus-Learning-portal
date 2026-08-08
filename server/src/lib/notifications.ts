type NotificationRow = {
  id: string
  type: 'comment_on_post' | 'reply_to_comment' | 'like_post' | 'like_comment' | 'streak_milestone'
  target_type: string | null
  target_id: string | null
  is_read: boolean
  created_at: string
  streak_days: number | null
}

function messageFor(notification: NotificationRow): string {
  switch (notification.type) {
    case 'comment_on_post': return 'Someone commented on your post'
    case 'reply_to_comment': return 'Someone replied to your comment'
    case 'like_post': return 'Someone liked your post'
    case 'like_comment': return 'Someone liked your comment'
    case 'streak_milestone': return notification.streak_days
      ? `You hit a ${notification.streak_days} day streak! 🔥`
      : 'You hit a streak milestone! 🔥'
  }
}

// Outward shape intentionally has no actor/author field.
export function serializeNotification(notification: NotificationRow) {
  return {
    id: notification.id,
    message: messageFor(notification),
    target_type: notification.target_type,
    target_id: notification.target_id,
    is_read: notification.is_read,
    created_at: notification.created_at,
  }
}
