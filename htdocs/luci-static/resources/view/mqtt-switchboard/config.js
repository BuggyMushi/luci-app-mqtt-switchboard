'use strict';
'require view';
'require form';
'require ui';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('mqtt-switchboard', _('MQTT Switchboard - Settings'),
			_('Configuration for Mushi MQTT Switchboard daemon and web dashboard.'));

		s = m.section(form.NamedSection, 'main', 'mqtt-switchboard', _('Configuration Options'));
		s.anonymous = false;
		s.addremove = false;

		// Tab definitions
		s.tab('general', _('General'));
		s.tab('mqtt', _('MQTT Broker'));
		s.tab('security', _('Dashboard & Security'));

		// --- TAB: General ---
		o = s.taboption('general', form.Flag, 'enabled', _('Enable Service'),
			_('Enable or disable background execution of the mqtt-switchboard daemon.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('general', form.Value, 'listen_addr', _('Listen Address'),
			_('IP address to bind the web server. Use 127.0.0.1 for local/reverse-proxy only, or 0.0.0.0 to allow LAN access.'));
		o.datatype = 'ipaddr';
		o.default = '127.0.0.1';
		o.placeholder = '127.0.0.1';
		o.rmempty = false;

		o = s.taboption('general', form.Value, 'listen_port', _('Listen Port'),
			_('TCP port on which the web dashboard and REST API listen.'));
		o.datatype = 'port';
		o.default = '8080';
		o.placeholder = '8080';
		o.rmempty = false;

		o = s.taboption('general', form.Value, 'discovery_prefix', _('Discovery Prefix'),
			_('Home Assistant MQTT auto-discovery topic prefix (default: homeassistant).'));
		o.default = 'homeassistant';
		o.placeholder = 'homeassistant';
		o.rmempty = false;

		o = s.taboption('general', form.Value, 'debounce_ms', _('Relay Debounce (ms)'),
			_('Debounce protection time in milliseconds to prevent relay chatter.'));
		o.datatype = 'uinteger';
		o.default = '1000';
		o.placeholder = '1000';
		o.rmempty = false;

		// --- TAB: MQTT Broker ---
		o = s.taboption('mqtt', form.Value, 'broker_url', _('Broker URL'),
			_('Full URL to MQTT Broker, e.g. tcp://127.0.0.1:1883 or ssl://broker.lan:8883.'));
		o.default = 'tcp://127.0.0.1:1883';
		o.placeholder = 'tcp://127.0.0.1:1883';
		o.rmempty = false;

		o = s.taboption('mqtt', form.Value, 'broker_client_id', _('Client ID'),
			_('MQTT Client ID reported to the broker upon connection.'));
		o.default = 'mqtt_switchboard_wrt';
		o.placeholder = 'mqtt_switchboard_wrt';
		o.rmempty = false;

		o = s.taboption('mqtt', form.Value, 'broker_user', _('Broker Username'),
			_('Username for MQTT authentication (leave empty if anonymous is permitted).'));
		o.rmempty = true;

		o = s.taboption('mqtt', form.Value, 'broker_pass', _('Broker Password'),
			_('Password for MQTT authentication (leave empty if not required).'));
		o.password = true;
		o.rmempty = true;

		// --- TAB: Dashboard & Security ---
		o = s.taboption('security', form.Value, 'admin_user', _('Admin Username'),
			_('Administrator username for logging into the Switchboard dashboard.'));
		o.default = 'admin';
		o.placeholder = 'admin';
		o.rmempty = false;

		o = s.taboption('security', form.Value, 'admin_password', _('Admin Password'),
			_('Administrator password for logging into the Switchboard dashboard. Plain text or bcrypt hash supported.'));
		o.password = true;
		o.default = 'admin';
		o.placeholder = 'admin';
		o.rmempty = false;

		o = s.taboption('security', form.Value, 'session_timeout', _('Session Duration (Days)'),
			_('Number of days web session tokens remain valid before re-login is required.'));
		o.datatype = 'uinteger';
		o.default = '7';
		o.placeholder = '7';
		o.rmempty = false;

		o = s.taboption('security', form.Flag, 'cookie_secure', _('Require HTTPS Cookies (Secure Cookie)'),
			_('When enabled, session cookies will only be transmitted via HTTPS. Leave UNCHECKED if accessing over plain HTTP (:8080) to prevent browser rejection.'));
		o.default = o.disabled;
		o.rmempty = false;

		return m.render();
	}
});
