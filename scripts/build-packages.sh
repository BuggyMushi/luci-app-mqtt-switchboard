#!/bin/bash
set -e

TAG_NAME="${GITHUB_REF_NAME:-v1.0.0}"
VERSION="${TAG_NAME#v}"
echo "Building packages for version: $VERSION"

mkdir -p build/ipk_data/www build/ipk_control dist

# 1. Assemble filesystem data tree
cp -r root/* build/ipk_data/
mkdir -p build/ipk_data/www
cp -r htdocs/* build/ipk_data/www/
chmod -R 755 build/ipk_data/
chmod 755 build/ipk_data/etc/init.d/mqtt-switchboard
chmod 755 build/ipk_data/etc/uci-defaults/80_mqtt-switchboard

# 2. Build control file for IPK (OpenWrt 24.10 and earlier)
cat << EOF > build/ipk_control/control
Package: luci-app-mqtt-switchboard
Version: ${VERSION}-1
Depends: luci-base
Section: luci
Architecture: all
Priority: optional
Maintainer: OpenWrt Community Developer
Description: LuCI web interface for Mushi MQTT Switchboard
EOF

# Create postinst to automatically refresh rpcd and flush cache
cat << 'EOF' > build/ipk_control/postinst
#!/bin/sh
[ -n "${IPKG_INSTROOT}" ] || {
    /etc/init.d/rpcd restart 2>/dev/null || true
    rm -rf /tmp/luci-* 2>/dev/null || true
}
exit 0
EOF
chmod 755 build/ipk_control/postinst

# 3. Create IPK archive (standard gzip-compressed tar)
echo "2.0" > build/debian-binary
tar -czf build/control.tar.gz -C build/ipk_control .
tar -czf build/data.tar.gz -C build/ipk_data .
tar -czf "dist/luci-app-mqtt-switchboard_${VERSION}-1_all.ipk" \
    -C build debian-binary control.tar.gz data.tar.gz

# 4. Create APK archive (OpenWrt 25.12+)
mkdir -p build/apk_tree
cp -r build/ipk_data/* build/apk_tree/
cat << EOF > build/apk_tree/.PKGINFO
pkgname = luci-app-mqtt-switchboard
pkgver = ${VERSION}-r1
pkgdesc = LuCI web interface for Mushi MQTT Switchboard
url = https://github.com/${GITHUB_REPOSITORY:-BuggyMushi/luci-app-mqtt-switchboard}
builddate = $(date +%s)
packager = OpenWrt Community Developer
size = $(du -sb build/apk_tree | cut -f1)
arch = noarch
license = MIT
depend = luci-base
EOF

tar -czf "dist/luci-app-mqtt-switchboard-${VERSION}-r1.apk" -C build/apk_tree .

# 5. Generate Checksums
cd dist
sha256sum * > SHA256SUMS.txt
ls -lh
