{
  "update_url": "https://clients2.google.com/service/update2/crx",
  "name": "MEI Preload",
  "description": "Contains preloaded data for Media Engagement",
  "version": "0.0.0.1",
  "manifest_version": 2,
  "icons": {}
}
{
  "manifest_version": 2,
  "name": "WidevineCdm",
  "description": "Widevine Content Decryption Module Stub",
  "offline_enabled": false,
  "version": "0.0.0.000",
  "minimum_chrome_version": "54.0.0.0",
  "x-cdm-module-versions": "4",
  "x-cdm-interface-versions": "8",
  "x-cdm-host-versions": "8",
  "x-cdm-codecs": "vp8,vp9.0,avc1",
  "platforms": [
    {
      "os": "win",
      "arch": "x86",
      "sub_package_path": "_platform_specific/win_x86/"
    },
    {
      "os": "win",
      "arch": "x64",
      "sub_package_path": "_platform_specific/win_x64/"
    },
    {
      "os": "mac",
      "arch": "x64",
      "sub_package_path": "_platform_specific/mac_x64/"
    }
  ]
}
