# wordpress-tpl

Docker Compose によるローカル WordPress 環境、Vite による SCSS/TypeScript ビルド（HMR 対応）、Wordmove によるリモート同期、GitHub Actions による自動デプロイを統合した WordPress テーマ開発テンプレート。

## 技術スタック

- **Docker Compose** — WordPress + MariaDB のローカル実行環境
- **Vite** — SCSS / TypeScript のビルドと HMR（Hot Module Replacement）
- **Wordmove** — リモート環境の DB・uploads を pull 同期
- **GitHub Actions** — main ブランチへの PR マージで自動デプロイ（rsync）

## 前提条件

- [Docker](https://www.docker.com/) および Docker Compose
- [Node.js](https://nodejs.org/)（v20 以上推奨）
- SSH 鍵（Wordmove によるリモート同期、GitHub Actions デプロイで使用）

## セットアップ

1. リポジトリをクローンする

```bash
git clone <repository-url>
cd wordpress-tpl
```

2. 環境変数ファイルを作成する

```bash
cp .env.example .env
```

`.env` を開き、`THEME_NAME`・データベース情報・リモートサーバー情報を環境に合わせて編集する。

3. 依存パッケージをインストールする

```bash
npm install
```

4. WordPress 環境を起動する

```bash
npm run up
```

ブラウザで http://localhost:8888 にアクセスし、WordPress の初期設定を行う。

## 開発

### 開発サーバー（HMR 対応）

```bash
npm run dev
```

Vite 開発サーバーが起動し、`src/scss/` および `src/ts/` 内のファイル変更をブラウザへ自動反映する。WordPress 側は `theme/dist/hot` ファイルを検知して Vite dev server からアセットを読み込む。

### 本番ビルド

```bash
npm run build
```

ミニファイ済みの CSS / JS を `theme/dist/` へ生成する。

### 環境の停止

```bash
npm run down
```

## リモート同期

Wordmove を使用してリモート環境の DB・uploads をローカルへ pull する。

> 前提: `.env` にリモートサーバーの接続情報を設定済みであること、SSH 鍵が `~/.ssh/` に配置済みであること、Docker が起動中であること。

### データベースの同期

```bash
npm run pull:db
```

### uploads ディレクトリの同期

```bash
npm run pull:uploads
```

### テーマファイルの同期

```bash
npm run pull:theme
```

### すべて同期

```bash
npm run pull:all
```

## ディレクトリ構成

```
wordpress-tpl/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # GitHub Actions デプロイワークフロー
│       └── verify-deploy.yml       # デプロイ先の検証ワークフロー
├── docker/
│   └── php.ini                     # PHP 設定（アップロード上限等）
├── src/
│   ├── scss/
│   │   ├── style.scss              # SCSS エントリポイント
│   │   ├── common/                 # リセット・変数・ミックスイン・レイアウト
│   │   ├── component/              # ヘッダー・フッター等の共通パーツ
│   │   └── page/                   # ページ固有のスタイル
│   └── ts/
│       ├── main.ts                 # TypeScript エントリポイント
│       ├── components/             # 再利用コンポーネント
│       ├── pages/                  # ページ固有のスクリプト
│       └── utils/                  # ユーティリティ関数
├── theme/                          # WordPress テーマ本体
│   ├── dist/                       # Vite ビルド出力先（git 管理外）
│   ├── assets/                     # 画像等の静的アセット
│   ├── style.css                   # WP テーマ識別用ヘッダー
│   ├── functions.php               # Vite アセット読み込み（dev/prod 自動切替）
│   ├── header.php                  # 共通ヘッダー
│   ├── footer.php                  # 共通フッター
│   └── index.php                   # フォールバックテンプレート
├── docker-compose.yml              # WordPress + MariaDB コンテナ定義
├── vite.config.ts                  # Vite ビルド設定
├── Movefile.yml                    # Wordmove 同期設定
├── package.json                    # npm scripts・依存パッケージ
├── tsconfig.json                   # TypeScript 設定
├── .env                            # 環境変数（git 管理外）
├── .env.example                    # 環境変数テンプレート
└── .gitignore
```

| パス | 役割 |
|------|------|
| `src/scss/` | SCSS ソースファイル。Vite が CSS へコンパイル |
| `src/ts/` | TypeScript ソースファイル。Vite が JS へコンパイル |
| `theme/` | WordPress テーマ本体。Docker でテーマディレクトリへマウントされる |
| `theme/dist/` | Vite ビルド出力先。git 管理外、CI で毎回ビルド |
| `docker/php.ini` | PHP の upload_max_filesize 等のカスタム設定 |
| `docker-compose.yml` | WordPress・MariaDB コンテナの定義 |
| `vite.config.ts` | ビルドのエントリポイント・出力先を定義 |
| `Movefile.yml` | Wordmove の接続先・同期設定 |
| `package.json` | npm scripts でコマンドを集約 |
| `.env` / `.env.example` | 環境固有の設定値（DB 認証、リモート接続情報） |

## デプロイ

`main` ブランチへの PR マージをトリガーに、GitHub Actions が自動でデプロイを実行する。

ワークフローの流れ:

1. `npm ci` で依存パッケージをインストール
2. `npm run build` でアセットを `theme/dist/` にビルド
3. `rsync` でテーマファイルをリモートサーバーへ転送

### GitHub Secrets の設定

リポジトリの Settings > Secrets and variables > Actions に以下を登録する。

| Secret 名 | 説明 |
|-----------|------|
| `SSH_PRIVATE_KEY` | デプロイ用 SSH 秘密鍵 |
| `SSH_HOST` | リモートサーバーのホスト名 |
| `SSH_USER` | SSH 接続ユーザー名 |
| `REMOTE_THEME_PATH` | リモートサーバー上のテーマディレクトリパス |

## 環境変数

`.env.example` をコピーして `.env` を作成し、各値を設定する。

### WordPress Theme

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `THEME_NAME` | WordPress テーマのディレクトリ名 | `my-theme` |

### Database（Docker Compose）

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `MARIADB_VERSION` | MariaDB のバージョン（リモートに合わせる） | `10.6` |
| `DB_NAME` | WordPress データベース名 | `wordpress` |
| `DB_USER` | データベースユーザー名 | `wordpress` |
| `DB_PASSWORD` | データベースパスワード | `wordpress` |
| `DB_ROOT_PASSWORD` | MariaDB root パスワード | `rootpassword` |
| `WORDPRESS_TABLE_PREFIX` | テーブルプレフィックス | `eboe_` |

### Remote Server（Wordmove）

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `REMOTE_URL` | リモートサイトの URL | `https://example.com` |
| `REMOTE_WP_PATH` | リモートの WordPress インストールパス | `/var/www/html` |
| `REMOTE_DB_NAME` | リモートデータベース名 | `wp_production` |
| `REMOTE_DB_USER` | リモートデータベースユーザー名 | `wp_user` |
| `REMOTE_DB_PASSWORD` | リモートデータベースパスワード | *(空)* |
| `REMOTE_DB_HOST` | リモートデータベースホスト | `localhost` |

### Remote SSH（Wordmove）

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `REMOTE_SSH_HOST` | SSH 接続先ホスト名 | `example.com` |
| `REMOTE_SSH_USER` | SSH ユーザー名 | `deploy` |
| `REMOTE_SSH_PORT` | SSH ポート番号 | `22` |

## トラブルシューティング

- [Wordmove SSH 接続エラー](docs/troubleshooting-ssh-key-format.md) — 鍵フォーマットエラー・ホストキー未登録エラーの対処法
