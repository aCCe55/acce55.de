# acce55.de

Personal landing page, served as plain static files by nginx.

- `index.html` – landing page: profile card with an animated globe that morphs into a live server-status view
- `404.html` – error page with its own globe and satellite animation
- `status.php` / `status.sh` – JSON endpoint behind the server-status view (uptime, CPU, RAM, disk, service states). Container states are read from `/run/container-status`, which is written by a root-owned job on the host and is not part of this repository
- `pfp.png`, `pfp_small.png`, `tatze_icon.svg` – images

No build step: the pages load Tailwind and icons from CDNs.
