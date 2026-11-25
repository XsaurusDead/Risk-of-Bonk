// Online (global) leaderboard — Supabase project settings.
//
// Fill these in to turn the public leaderboard on (see README → "Online leaderboard"):
//   url: Supabase → Project Settings → Data API → Project URL   (https://xxxx.supabase.co)
//   key: Supabase → Project Settings → API Keys → the PUBLIC key  ("anon" / "publishable")
// Both are meant to be public: the database only lets this key call the leaderboard
// functions from supabase/leaderboard.sql. NEVER put the "service_role" / secret key here.
//
// Left empty, the game works exactly as before with only the local (this device) board.
export const ONLINE = {
  url: 'https://ulippxnckxsqbtnllanb.supabase.co',
  key: 'sb_publishable_4qYMSD2-jsoLyBybhR4WcQ_Sncs7dbe',
};
