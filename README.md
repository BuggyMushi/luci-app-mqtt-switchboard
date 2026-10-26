# luci-app-mqtt-switchboard

LuCI support for **Mushi MQTT Switchboard** (`mqtt-switchboard`).

This package provides a modern client-side JavaScript LuCI interface (compatible with OpenWrt 23.05, 24.10, and 25.12) to configure and monitor the `mqtt-switchboard` gateway and web dashboard.

---

## Features

- **Live Service Diagnostics**: Monitors `procd` service lifecycle, daemon PID, and real-time health statistics (`/api/health`).
- **MQTT Gateway Status**: Displays broker connectivity state, uptime, discovered Home Assistant entities, and active web sessions.
- **Direct Portal Launch**: Convenient navigation links for both standard browser and low-bandwidth/E-ink display modes (`?eink=1`).
- **UCI Parameter Management**:
  - Service daemon enable/disable
  - Network binding address and HTTP port
  - MQTT broker parameters (URL, Client ID, credentials)
  - Home Assistant auto-discovery prefix
  - Hardware relay debounce window (ms)
  - Security options (Admin credentials, session lifetime, cookie HTTPS flags)

---

## UCI Configuration (`/etc/config/mqtt-switchboard`)

The configuration is managed under the `main` section:

```uci
config mqtt-switchboard 'main'
	option enabled '1'
	option listen_addr '127.0.0.1'
	option listen_port '8080'
	option broker_url 'tcp://127.0.0.1:1883'
	option broker_client_id 'mqtt_switchboard_wrt'
	option broker_user ''
	option broker_pass ''
	option discovery_prefix 'homeassistant'
	option debounce_ms '1000'
	option session_timeout '7'
	option cookie_secure '0'
	option admin_user 'admin'
	option admin_password 'admin'
```

### Options Reference

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | `bool` | `'1'` | Enable/disable service daemon on boot |
| `listen_addr` | `ipaddr` | `'127.0.0.1'` | IP address to bind HTTP dashboard |
| `listen_port` | `port` | `'8080'` | TCP port for HTTP dashboard |
| `broker_url` | `string` | `'tcp://127.0.0.1:1883'` | MQTT Broker connection URL |
| `broker_client_id` | `string` | `'mqtt_switchboard_wrt'` | Client ID reported to the MQTT broker |
| `broker_user` | `string` | `''` | Broker authentication username (optional) |
| `broker_pass` | `string` | `''` | Broker authentication password (optional) |
| `discovery_prefix`| `string` | `'homeassistant'` | HA MQTT discovery prefix |
| `debounce_ms` | `uinteger`| `'1000'` | Relay chatter protection time (ms) |
| `session_timeout` | `uinteger`| `'7'` | Web session cookie lifetime (days) |
| `cookie_secure` | `bool` | `'0'` | Restrict session cookie to HTTPS |
| `admin_user` | `string` | `'admin'` | Dashboard admin username |
| `admin_password` | `string` | `'admin'` | Dashboard admin password |

---

## License

MIT License.
