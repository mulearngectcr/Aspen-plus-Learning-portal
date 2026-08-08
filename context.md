I'm building "Chem-E Bootcamp" — a web app for GEC Thrissur's mulearn
Chemical Engineering interest group's 4-month bootcamp. Students post
daily study updates (text up to 3,000 chars + up to 2 images, no video/
PDF). Others can leave Reddit-style threaded comments (unlimited depth).
Posting daily builds a personal streak (Sundays are a free pass —
skipping Sunday doesn't break the streak, posting on Sunday is optional).

CRITICAL: Posts AND comments are fully anonymous to other students — no
name, username, or avatar attached, ever. Only the DB/backend knows who
posted what. Students can still delete their own posts/comments, and can
delete comments on posts they own, without needing to know who wrote them
(deletion is by ID, not by identity). Notifications are generic
("Someone commented on your post") — never reveal who.

Admins (profiles.is_admin = true, same login as regular students) see
real identity on everything and can delete any post/comment for
moderation, with actions logged.

Stack: React (Vite) + TailwindCSS frontend, Express API in between,
Supabase (Postgres, Auth, Storage) as the datastore. Express holds the
Supabase SERVICE ROLE key (server-side only, never in frontend code) and
is the only path to posts/comments/likes/notifications data — direct
table access from the frontend is revoked in Postgres for those tables.
Supabase Auth (client-side) is still used for signup/login/session only.
Only @gectcr.ac.in emails can sign up. Performance matters — this
needs to feel fast.

Need a MONO-repo
/client for frontend code
/server for backend code
