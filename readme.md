# 機能の概要
ブラウザでIDベース暗号を使って暗号化、復号化する
setupでmaster secret key, master public key,secret key を入手
メッセージを暗号化したい場合はそのまま暗号化する→復号化する
ファイルを暗号化したい場合はファイル選択→暗号化＆ダウンロード→暗号化したファイルを選択→復号化＆ダウンロード（テキストファイルのみ）
基本的に↓のプログラムを書き換えた
https://github.com/herumi/mcl-wasm/tree/master/browser
