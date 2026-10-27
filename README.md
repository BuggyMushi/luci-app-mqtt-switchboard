# luci-app-mqtt-switchboard

LuCI support for **Mushi MQTT Switchboard** (`mqtt-switchboard`).

This package provides a modern client-side JavaScript LuCI interface (compatible with OpenWrt 23.05, 24.10, and 25.12) to configure and monitor the `mqtt-switchboard` gateway and web dashboard.

---

## Features

- **Live Service Diagnostics**: Monitors `procd` service lifecycle, daemon PID, and real-time health statistics (`/api/health`).
- **MQTT Gateway Status**: Displays broker connectivity state, uptime, discovered Home Assistant entities, and active web sessions.
- **Direct Portal Launch**:
  - 🌐 Standard full-featured interactive Web dashboard
  - 📟 E-Ink / Paper low-power mode (`?eink=1`)
  - 📖 Kindle / Legacy E-Ink Server-Side Rendered mode (`/lite`)
- **UCI Parameter Management**:
  - Service daemon enable/disable
  - Network binding address (`0.0.0.0` by default) and HTTP port
  - MQTT broker parameters (URL, Client ID, credentials)
  - Home Assistant auto-discovery prefix
  - Hardware relay debounce window (ms)
  - Security options (Session lifetime, cookie HTTPS flags)
  - Multi-user credential management (`config user` list table)
- **Internationalization (i18n)**:
  - English (Built-in default)
  - Traditional Chinese (`zh_Hant`)
  - Simplified Chinese (`zh_Hans`)
- **Automated Multi-Format Releases**:
  - Generates `.ipk` (opkg for OpenWrt 24.10 and earlier)
  - Generates `.apk` (apk-tools for OpenWrt 25.12 and later)

---

## UCI Configuration (`/etc/config/mqtt-switchboard`)

```uci
config mqtt-switchboard 'main'
	option enabled '1'
	option listen_addr '0.0.0.0'
	option listen_port '8080'
	option broker_url 'tcp://127.0.0.1:1883'
	option broker_client_id 'mqtt_switchboard_wrt'
	option broker_user ''
	option broker_pass ''
	option discovery_prefix 'homeassistant'
	option debounce_ms '1000'
	option session_timeout '7'
	option cookie_secure '0'

config user
	option username 'admin'
	option password 'admin'
```

### Options Reference (`main`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | `bool` | `'1'` | Enable/disable service daemon on boot |
| `listen_addr` | `ipaddr` | `'0.0.0.0'` | IP address to bind HTTP dashboard |
| `listen_port` | `port` | `'8080'` | TCP port for HTTP dashboard |
| `broker_url` | `string` | `'tcp://127.0.0.1:1883'` | MQTT Broker connection URL |
| `broker_client_id` | `string` | `'mqtt_switchboard_wrt'` | Client ID reported to the MQTT broker |
| `broker_user` | `string` | `''` | Broker authentication username (optional) |
| `broker_pass` | `string` | `''` | Broker authentication password (optional) |
| `discovery_prefix`| `string` | `'homeassistant'` | HA MQTT discovery prefix |
| `debounce_ms` | `uinteger`| `'1000'` | Relay chatter protection time (ms) |
| `session_timeout` | `uinteger`| `'7'` | Web session cookie lifetime (days) |
| `cookie_secure` | `bool` | `'0'` | Restrict session cookie to HTTPS |

### User Section (`user`)

| Option | Type | Description |
| :--- | :--- | :--- |
| `username` | `string` | Dashboard login username |
| `password` | `string` | Dashboard login password |

---

## Packaging & Releases

Pushing a version tag (e.g. `v1.0.0`) automatically triggers GitHub Actions to build:
- `luci-app-mqtt-switchboard_<version>-1_all.ipk`
- `luci-app-mqtt-switchboard-<version>-r1.apk`
- `SHA256SUMS.txt`

---

## License

MIT License.
