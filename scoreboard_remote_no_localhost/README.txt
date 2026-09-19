REMOTE SCOREBOARD — NO LOCALHOST

This version is designed to be hosted as a static website (GitHub Pages, Vercel, Netlify, etc.).

1. Upload the entire folder to a static host.
2. OBS Browser Source URL:
   https://YOUR-SITE.com/?room=topball-scoreboard
3. Open:
   https://YOUR-SITE.com/control.html
4. Use the same room name and click CONNECT.

The control page can:
- change HOME/AWAY team names
- upload custom team logos directly from your PC
- change scores
- start/pause/reset the timer
- set an exact timer value

The OBS scoreboard and control page communicate through PeerJS/WebRTC, so no localhost server is required.

IMPORTANT:
- Both OBS and the control page need internet access.
- Keep the OBS Browser Source open while controlling it.
- Use a unique room name if you want to avoid another scoreboard using the same room.
- The control page's uploaded logos are sent to the OBS browser session and are not uploaded to a storage server.
