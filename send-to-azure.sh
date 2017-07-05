#!/bin/sh

# 設定ファイルの置き場（フルパス）
export NODE_CONFIG_DIR = "/home/pi/cllab-device-client-azure/config"

# スクリプトの実行
/usr/local/nvm/versions/node/v4.8.3/bin/node /home/pi/cllab-device-client-azure/send-to-azure.js
