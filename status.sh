#!/bin/bash

UPTIME=$(uptime -p | sed 's/up //')
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
RAM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
RAM_USED=$(free -m | awk '/^Mem:/{print $3}')
RAM_PCT=$(awk "BEGIN {printf \"%.0f\", ($RAM_USED/$RAM_TOTAL)*100}")
DISK_TOTAL=$(df -h / | awk 'NR==2{print $2}')
DISK_USED=$(df -h / | awk 'NR==2{print $3}')
DISK_FREE=$(df -h / | awk 'NR==2{print $4}')
DISK_PCT=$(df / | awk 'NR==2{print $5}')
HDD_TOTAL=$(df -h /mnt/hdd | awk 'NR==2{print $2}')
HDD_USED=$(df -h /mnt/hdd | awk 'NR==2{print $3}')
HDD_FREE=$(df -h /mnt/hdd | awk 'NR==2{print $4}')
HDD_PCT=$(df /mnt/hdd | awk 'NR==2{print $5}')

# systemctl: returns "active" – normalize to "running"
check_service() {
  STATUS=$(systemctl is-active "$1" 2>/dev/null)
  if [ "$STATUS" = "active" ]; then echo "running"; else echo "stopped"; fi
}

# Container states are written by root (container-status.timer) to /run/container-status,
# so www-data does not need access to the docker socket.
check_container() {
  STATUS=$(cat "/run/container-status/$1" 2>/dev/null)
  if [ "$STATUS" = "running" ]; then echo "running"
  elif [ -z "$STATUS" ] || [ "$STATUS" = "absent" ]; then echo "absent"
  else echo "stopped"; fi
}

NGINX=$(check_service nginx)
NC=$(check_container nextcloud)
NC_DB=$(check_container nextcloud-db)
COLLABORA=$(check_container collabora)
WHITEBOARD=$(check_container whiteboard)
STIRLING=$(check_container stirling-pdf)
DYNDNS=$(check_container dyndns-updater-1)
MINECRAFT=$(cat /run/container-status/minecraft 2>/dev/null || echo stopped)

cat <<JSON
{
  "uptime": "$UPTIME",
  "cpu": "$CPU",
  "ram": {
    "used": $RAM_USED,
    "total": $RAM_TOTAL,
    "percent": $RAM_PCT
  },
  "disk": {
    "used": "$DISK_USED",
    "total": "$DISK_TOTAL",
    "free": "$DISK_FREE",
    "percent": "$DISK_PCT"
  },
  "hdd": {
    "used": "$HDD_USED",
    "total": "$HDD_TOTAL",
    "free": "$HDD_FREE",
    "percent": "$HDD_PCT"
  },
  "services": {
    "nginx":      "$NGINX",
    "nextcloud":  "$NC",
    "mariadb":    "$NC_DB",
    "collabora":  "$COLLABORA",
    "whiteboard": "$WHITEBOARD",
    "stirling":   "$STIRLING",
    "dyndns":     "$DYNDNS",
    "minecraft":  "$MINECRAFT"
  }
}
JSON
