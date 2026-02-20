# Research & Design Decisions

## Summary
- **Feature**: `wp-dev-environment`
- **Discovery Scope**: New Feature（グリーンフィールド）
- **Key Findings**:
  - Viteはライブラリモードではなく `build.rollupOptions` で複数エントリポイント（SCSS/TS）を管理し、`build --watch` でファイル監視を行う
  - Docker ComposeではMariaDBがARM64/AMD64の互換性に優れ、テーマディレクトリのみをバインドマウントすることでmacOSのパフォーマンス問題を軽減できる
  - WordmoveはDockerイメージ（welaika/wordmove）で実行し、`Movefile.yml` のERB構文で環境変数を参照する。push操作はforbidセクションで制限可能
  - GitHub Actionsデプロイはrsync over SSHが標準的アプローチ

## Research Log

### Vite によるWordPressテーマ向けアセットビルド
- **Context**: SCSS/TSをビルドしてWordPressテーマへ直接出力する設定の調査
- **Sources Consulted**: Vite公式ドキュメント、WordPress + Vite統合事例
- **Findings**:
  - `vite build --watch` でRollupのwatcherを利用したファイル監視が可能
  - ライブラリモードは避け、`build.rollupOptions.input` で複数エントリポイントを定義
  - SCSSはViteの組み込みサポートで処理（追加プラグイン不要）
  - `css.preprocessorOptions.scss.additionalData` でグローバル変数を注入可能
  - 必要パッケージ: `vite`, `sass`, `typescript`
- **Implications**: vite.config.ts単一ファイルで設定完結。HMRは使用せず、build --watchモードのみで運用

### Docker Compose によるWordPress環境
- **Context**: WP + DB のコンテナ構成調査
- **Sources Consulted**: Docker Hub公式イメージ、Docker Compose公式サンプル
- **Findings**:
  - WordPressイメージ: `wordpress:php8.3-apache` が最新安定版
  - DB: MariaDBがARM64互換性に優れる（`mariadb:11`）
  - macOSではバインドマウントのパフォーマンスが問題になるため、テーマディレクトリのみマウント推奨
  - DBデータはnamed volumeで永続化
- **Implications**: docker-compose.ymlにWP + MariaDB の2サービス構成。環境変数は.envファイルで管理

### Wordmove によるリモート同期
- **Context**: Pull専用ワークフローの設定調査
- **Sources Consulted**: Wordmove GitHub Wiki、公式ドキュメント
- **Findings**:
  - Dockerイメージ `welaika/wordmove` で実行可能（Rubyインストール不要）
  - `Movefile.yml` のERB構文: `<%= ENV['VAR_NAME'] %>` で環境変数参照
  - `.env` ファイルをMovefile.ymlと同ディレクトリに配置で自動読み込み
  - forbidセクションでpush操作を制限可能
  - SSH公開鍵認証はpasswordフィールド省略で有効化
- **Implications**: Wordmoveコンテナ実行用のnpm scriptを定義。pushはforbidで制限

### GitHub Actions デプロイ
- **Context**: テーマファイルのリモートサーバーへの自動デプロイ調査
- **Sources Consulted**: GitHub Actions公式ドキュメント、WordPress CI/CD事例
- **Findings**:
  - rsync over SSHが最もシンプルかつ標準的
  - ワークフロー: checkout → Node.jsセットアップ → npm install → npm run build → rsync
  - 必要なSecrets: `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, `REMOTE_PATH`
  - `webfactory/ssh-agent` アクションでSSH鍵を設定
- **Implications**: 単一YAMLファイルでビルド+デプロイを完結

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| フラット構成 | ルートに全設定ファイル、src/にソース、テーマディレクトリにWPファイル | シンプル、見通し良い、学習コスト低 | 大規模化時に整理が必要 | シンプル最優先の要件に合致 |
| モノレポ構成 | packages/で各ツールを分離 | 関心の分離が明確 | 過剰な複雑性、小規模に不向き | 不採用: オーバーエンジニアリング |

## Design Decisions

### Decision: Viteのビルドモード選定
- **Context**: Vite Dev Server (HMR) vs build --watch の選択
- **Alternatives Considered**:
  1. Vite Dev Server + HMR — フルHMR対応でリアルタイム更新
  2. vite build --watch — ファイル変更時に自動ビルド、テーマへ直接出力
- **Selected Approach**: `vite build --watch`
- **Rationale**: WordPressはPHPテンプレートでアセットを読み込むため、Dev ServerのHMRプロキシ設定が複雑になる。build --watchならビルド済みファイルをテーマに直接出力でき、WordPressのエンキュー機構とシンプルに統合可能
- **Trade-offs**: HMRによるCSS即時反映は失われるが、ビルド速度は十分高速（Viteのため）
- **Follow-up**: ビルド出力先パスの確認

### Decision: データベースイメージの選定
- **Context**: MySQL vs MariaDB の選択
- **Alternatives Considered**:
  1. MySQL 8.x — WordPress公式推奨
  2. MariaDB 11 — MySQL互換、ARM64対応良好
- **Selected Approach**: MariaDB 11
- **Rationale**: Apple Silicon (ARM64) 環境での安定性が高く、WordPressとの互換性も問題ない。公式docker-composeサンプルでも採用実績あり
- **Trade-offs**: MySQL固有機能が必要な場合は追加検証が必要だが、WordPress用途では発生しない
- **Follow-up**: なし

### Decision: Wordmoveの実行方法
- **Context**: Ruby gem直接インストール vs Dockerイメージ
- **Alternatives Considered**:
  1. `gem install wordmove` — ローカルRuby環境に依存
  2. `docker run welaika/wordmove` — 隔離された実行環境
- **Selected Approach**: Dockerイメージ（`welaika/wordmove`）
- **Rationale**: Ruby環境のセットアップが不要。Docker Composeベースの開発環境と統一感がある。rsyncも同梱済み
- **Trade-offs**: Docker実行時にSSH鍵やMovefile.ymlのマウントが必要
- **Follow-up**: npm scriptでdocker runコマンドをラップ

### Decision: デプロイ方式
- **Context**: GitHub Actionsでのデプロイ転送方式
- **Alternatives Considered**:
  1. rsync over SSH — 差分転送、高速
  2. FTP/SFTP — レガシーだが広くサポート
  3. WP-CLI + SSH — WordPress固有操作が可能
- **Selected Approach**: rsync over SSH
- **Rationale**: 差分転送で高速、GitHub Actionsとの統合が容易、シンプルな構成で実現可能
- **Trade-offs**: サーバー側にrsyncが必要（ほぼ標準インストール済み）
- **Follow-up**: rsyncの除外パターン（.git, node_modules, src等）の定義

## Risks & Mitigations
- macOSバインドマウントのパフォーマンス — テーマディレクトリのみマウントし影響を最小化
- Wordmove誤操作によるリモートへのpush — forbidセクションでpush操作を制限
- GitHub Secretsの漏洩 — 最小権限のSSH鍵を使用、デプロイ専用ユーザーを設定
- Viteバージョン更新による破壊的変更 — package.jsonでメジャーバージョンを固定

## References
- [Vite公式ドキュメント - Build Options](https://vite.dev/config/build-options)
- [WordPress Docker Hub](https://hub.docker.com/_/wordpress)
- [Wordmove GitHub](https://github.com/welaika/wordmove)
- [Wordmove Wiki - Movefile.yml](https://github.com/welaika/wordmove/wiki/movefile.yml-configurations-explained)
- [GitHub Actions - rsync deploy](https://github.com/jaredpalmer/github-actions-rsync)
- [Docker Compose WordPress サンプル](https://github.com/docker/awesome-compose/blob/master/wordpress-mysql/README.md)
