'use strict';
'require view';
'require dom';
'require poll';
'require rpc';
'require uci';
'require ui';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function isServiceRunning(res) {
	if (!res) return false;
	var svc = res['mqtt-switchboard'] || res;
	if (svc && svc.instances) {
		for (var k in svc.instances) {
			if (svc.instances[k] && svc.instances[k].running) {
				return svc.instances[k];
			}
		}
	}
	return null;
}

function formatUptime(seconds) {
	if (!seconds || seconds <= 0) return '0s';
	var d = Math.floor(seconds / 86400);
	var h = Math.floor((seconds % 86400) / 3600);
	var m = Math.floor((seconds % 3600) / 60);
	var s = seconds % 60;
	var res = [];
	if (d > 0) res.push(d + 'd');
	if (h > 0) res.push(h + 'h');
	if (m > 0) res.push(m + 'm');
	res.push(s + 's');
	return res.join(' ');
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('mqtt-switchboard'),
			callServiceList({ name: 'mqtt-switchboard' })
		]);
	},

	render: function(data) {
		var uciConfig = uci.sections('mqtt-switchboard', 'mqtt-switchboard')[0] || {};
		var enabled = uciConfig.enabled !== '0';
		var listenAddr = uciConfig.listen_addr || '127.0.0.1';
		var listenPort = uciConfig.listen_port || '8080';

		var clientHost = window.location.hostname || '127.0.0.1';
		var targetHost = (listenAddr === '0.0.0.0' || listenAddr === '127.0.0.1') ? clientHost : listenAddr;
		var portalUrl = 'http://' + targetHost + ':' + listenPort + '/';
		var einkUrl = 'http://' + targetHost + ':' + listenPort + '/?eink=1';
		var liteUrl = 'http://' + targetHost + ':' + listenPort + '/lite';

		var viewRoot = E('div', { 'class': 'cbi-map' }, [
			E('h2', {}, _('MQTT Switchboard - Overview')),
			E('div', { 'class': 'cbi-map-descr' },
				_('Real-time system diagnostics, daemon status, and direct portal navigation.')),

			// Service & Health Status Card
			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('Service Status')),
				E('table', { 'class': 'table' }, [
					E('tr', { 'class': 'tr' }, [
						E('td', { 'class': 'td left', 'style': 'width: 30%' }, _('Procd Daemon')),
						E('td', { 'class': 'td left', 'id': 'swb_procd_status' }, E('em', {}, _('Checking...')))
					]),
					E('tr', { 'class': 'tr' }, [
						E('td', { 'class': 'td left' }, _('MQTT Broker Connection')),
						E('td', { 'class': 'td left', 'id': 'swb_mqtt_status' }, E('em', {}, _('Checking...')))
					]),
					E('tr', { 'class': 'tr' }, [
						E('td', { 'class': 'td left' }, _('Service Version')),
						E('td', { 'class': 'td left', 'id': 'swb_version' }, '-')
					]),
					E('tr', { 'class': 'tr' }, [
						E('td', { 'class': 'td left' }, _('Service Uptime')),
						E('td', { 'class': 'td left', 'id': 'swb_uptime' }, '-')
					]),
					E('tr', { 'class': 'tr' }, [
						E('td', { 'class': 'td left' }, _('Discovered Relays & Switches')),
						E('td', { 'class': 'td left', 'id': 'swb_devices' }, '-')
					]),
					E('tr', { 'class': 'tr' }, [
						E('td', { 'class': 'td left' }, _('Active Web Sessions')),
						E('td', { 'class': 'td left', 'id': 'swb_sessions' }, '-')
					])
				])
			]),

			// Quick Navigation Section
			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('Switchboard Dashboard Portals')),
				E('div', { 'style': 'display: flex; gap: 15px; flex-wrap: wrap; margin-top: 10px;' }, [
					E('a', {
						'class': 'btn cbi-button-action',
						'href': portalUrl,
						'target': '_blank',
						'rel': 'noreferrer',
						'style': 'padding: 10px 18px; font-size: 14px; text-decoration: none;'
					}, '🌐 ' + _('Open Full Dashboard')),

					E('a', {
						'class': 'btn cbi-button-neutral',
						'href': einkUrl,
						'target': '_blank',
						'rel': 'noreferrer',
						'style': 'padding: 10px 18px; font-size: 14px; text-decoration: none;'
					}, '📟 ' + _('Open E-Ink / Paper Mode (?eink=1)')),

					E('a', {
						'class': 'btn cbi-button-neutral',
						'href': liteUrl,
						'target': '_blank',
						'rel': 'noreferrer',
						'style': 'padding: 10px 18px; font-size: 14px; text-decoration: none;'
					}, '📖 ' + _('Open Kindle / Low-Bandwidth Mode (/lite)'))
				]),
				(listenAddr === '127.0.0.1') ? E('div', { 'class': 'alert-message warning', 'style': 'margin-top: 15px;' }, [
					E('strong', {}, _('Notice: ')),
					_('The listen address is currently configured as 127.0.0.1 (localhost only). If direct portal access from your LAN fails, please navigate to Settings and change Listen Address to 0.0.0.0.')
				]) : E('span')
			])
		]);

		function updateStatus() {
			callServiceList({ name: 'mqtt-switchboard' }).then(function(svcRes) {
				var inst = isServiceRunning(svcRes);
				var procdEl = viewRoot.querySelector('#swb_procd_status');

				if (inst && inst.running) {
					procdEl.innerHTML = '<span class="badge" style="background:#28a745; color:white; padding:3px 8px; border-radius:3px;">' +
						_('RUNNING') + ' (PID: ' + inst.pid + ')</span>';
				} else if (!enabled) {
					procdEl.innerHTML = '<span class="badge" style="background:#6c757d; color:white; padding:3px 8px; border-radius:3px;">' +
						_('DISABLED IN SETTINGS') + '</span>';
				} else {
					procdEl.innerHTML = '<span class="badge" style="background:#dc3545; color:white; padding:3px 8px; border-radius:3px;">' +
						_('STOPPED') + '</span>';
				}

				// Try querying health API from browser
				var healthUrl = 'http://' + targetHost + ':' + listenPort + '/api/health';
				fetch(healthUrl, { cache: 'no-store' })
					.then(function(res) {
						if (!res.ok) throw new Error('HTTP ' + res.status);
						return res.json();
					})
					.then(function(health) {
						var mqttEl = viewRoot.querySelector('#swb_mqtt_status');
						var verEl = viewRoot.querySelector('#swb_version');
						var uptimeEl = viewRoot.querySelector('#swb_uptime');
						var devicesEl = viewRoot.querySelector('#swb_devices');
						var sessionsEl = viewRoot.querySelector('#swb_sessions');

						if (health.mqtt_connected) {
							mqttEl.innerHTML = '<span class="badge" style="background:#28a745; color:white; padding:3px 8px; border-radius:3px;">' +
								_('CONNECTED') + '</span>';
						} else {
							mqttEl.innerHTML = '<span class="badge" style="background:#ffc107; color:black; padding:3px 8px; border-radius:3px;">' +
								_('DISCONNECTED / CONNECTING') + '</span>';
						}

						verEl.textContent = health.version || '1.0.0';
						uptimeEl.textContent = formatUptime(health.uptime_seconds);
						devicesEl.textContent = (health.discovered_devices_count !== undefined) ? health.discovered_devices_count : '0';
						sessionsEl.textContent = (health.active_sessions !== undefined) ? health.active_sessions : '0';
					})
					.catch(function() {
						var mqttEl = viewRoot.querySelector('#swb_mqtt_status');
						if (inst && inst.running) {
							mqttEl.innerHTML = '<span class="badge" style="background:#6c757d; color:white; padding:3px 8px; border-radius:3px;">' +
								_('DAEMON ACTIVE (Direct API unreachable via browser)') + '</span>';
						} else {
							mqttEl.innerHTML = '<span class="badge" style="background:#6c757d; color:white; padding:3px 8px; border-radius:3px;">-</span>';
						}
					});
			});
		}

		// Initial poll and recurring update
		updateStatus();
		poll.add(updateStatus, 4);

		return viewRoot;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
