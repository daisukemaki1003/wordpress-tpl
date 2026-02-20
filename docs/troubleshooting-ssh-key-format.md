# トラブルシューティング: Wordmove SSH 鍵フォーマットエラー

## 1. エラーの概要

Docker Compose 経由で Wordmove（`npm run pull:db` / `npm run pull:uploads`）を実行した際、以下のエラーが発生し SSH 接続に失敗する。

```
OpenSSH keys only supported if ED25519 is available (NotImplementedError)
net-ssh requires the following gems for ed25519 support:
 * ed25519 (>= 1.2, < 2.0)
 * bcrypt_pbkdf (>= 1.0, < 2.0)
```

## 2. 技術的な原因

### エラーメッセージの誤解

エラーメッセージは「ED25519 サポートが必要」と表示されるが、**鍵アルゴリズムの問題ではない**。
実際の原因は **鍵ファイルのフォーマット** にある。

### 根本原因

OpenSSH 7.8 以降、`ssh-keygen` はデフォルトで **OpenSSH 独自形式（RFC 4716 準拠の新形式）** で秘密鍵を生成する。

```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

一方、Wordmove コンテナ内部で使用される **net-ssh 6.x**（Ruby の SSH ライブラリ）は、この新形式の鍵を読み込む際に `ed25519` gem と `bcrypt_pbkdf` gem を要求する。`welaika/wordmove` Docker イメージにはこれらの gem がインストールされていないため、RSA 鍵であっても新形式で保存されていると上記エラーが発生する。

### 影響の流れ

```
ssh-keygen（ホスト側）
  ↓ OpenSSH 新形式で鍵を生成
~/.ssh/id_rsa（OpenSSH 形式）
  ↓ docker-compose.yml でマウント
/root/.ssh/id_rsa（コンテナ内）
  ↓ Wordmove が net-ssh で読み込み
net-ssh 6.x → OpenSSH 形式を検出 → ed25519 gem を要求 → NotImplementedError
```

### 関連する構成

本プロジェクトでは `docker-compose.yml` 内で以下のように SSH 鍵をマウントしている。

```yaml
wordmove:
  image: welaika/wordmove
  volumes:
    - ${SSH_KEY_PATH}:/root/.ssh/id_rsa:ro
```

`SSH_KEY_PATH`（`.env` で設定）が指す秘密鍵が OpenSSH 新形式の場合にこのエラーが発生する。

## 3. 解決方法

### 手順: PEM 形式への変換

SSH 秘密鍵を、net-ssh が対応している **PEM 形式（旧形式）** に変換する。

```bash
ssh-keygen -p -m pem -f ~/.ssh/coreserver/wordmove_rsa
```

| オプション | 説明 |
|-----------|------|
| `-p` | 既存鍵のパスフレーズを変更する（形式変換にも使用） |
| `-m pem` | 出力形式を PEM に指定 |
| `-f <path>` | 変換対象の秘密鍵ファイルパス |

実行すると現在のパスフレーズの入力を求められる。パスフレーズ未設定の場合はそのまま Enter を押す。

変換後の鍵ファイルは以下のヘッダーに変わる。

```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

### 変換前後の確認方法

```bash
# 変換前（OpenSSH 新形式）
head -1 ~/.ssh/coreserver/wordmove_rsa
# => -----BEGIN OPENSSH PRIVATE KEY-----

# 変換後（PEM 形式）
head -1 ~/.ssh/coreserver/wordmove_rsa
# => -----BEGIN RSA PRIVATE KEY-----
```

### 注意事項

- **変換はインプレース（上書き）** で行われる。バックアップが必要な場合は事前にコピーを取ること。
  ```bash
  cp ~/.ssh/coreserver/wordmove_rsa ~/.ssh/coreserver/wordmove_rsa.bak
  ```
- 公開鍵（`.pub`）の変更は不要。PEM 形式への変換は秘密鍵のエンコーディングのみを変更し、鍵ペアとしての整合性は維持される。
- 変換後も SSH 接続先での認証には影響しない（公開鍵は同一のまま）。

## 4. 参考情報

- [net-ssh: OpenSSH private key support](https://github.com/net-ssh/net-ssh#openssh-private-key-support)
- [OpenSSH 7.8 リリースノート（鍵形式のデフォルト変更）](https://www.openssh.com/txt/release-7.8)
- [Wordmove Docker イメージ](https://hub.docker.com/r/welaika/wordmove)
