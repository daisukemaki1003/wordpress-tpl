# Requirements Document

## Introduction
本ドキュメントは、WordPress開発環境の要件を定義する。Docker Composeによるローカル環境管理、Viteによるフロントエンドアセットのビルド・即時反映、Wordmoveによるリモートからのコンテンツ同期、GitHub Actionsによるデプロイを統合したシンプルな開発ワークフローを実現する。

## Project Description (Input)
WordPress開発環境をcc-sddで設計する。要件: Docker ComposeでWP+DBを管理。ViteでSCSS/TSをwatchしてWordPressテーマへ即反映。Wordmoveでリモート同期（pull中心）。デプロイはGitHub Actionsのみ（Wordmoveでdeployしない）。シンプル最優先。

## Requirements

### Requirement 1: Docker Composeによるローカル環境
**Objective:** As a 開発者, I want Docker Composeで WordPress と データベースをワンコマンドで起動・停止したい, so that ローカル開発環境のセットアップを簡素化できる

#### Acceptance Criteria
1. When `docker compose up` を実行した時, the 開発環境 shall WordPressコンテナとMySQLコンテナを起動し、WordPressがブラウザからアクセス可能な状態にする
2. When `docker compose down` を実行した時, the 開発環境 shall すべてのコンテナを停止する
3. The 開発環境 shall MySQLのデータをDockerボリュームで永続化し、コンテナ再起動後もデータを保持する
4. The 開発環境 shall テーマディレクトリをホストからコンテナへマウントし、ローカルの変更が即座にWordPressへ反映される構成とする
5. The 開発環境 shall `docker-compose.yml` 単一ファイルで環境全体を定義する

### Requirement 2: ViteによるSCSS/TSビルドとWatch
**Objective:** As a 開発者, I want ViteでSCSSとTypeScriptをwatch・ビルドし、WordPressテーマへ即時反映したい, so that フロントエンド開発のイテレーションを高速化できる

#### Acceptance Criteria
1. When Viteのwatchモードを起動した時, the ビルドシステム shall SCSSファイルの変更を検知し、CSSへコンパイルしてテーマディレクトリへ出力する
2. When Viteのwatchモードを起動した時, the ビルドシステム shall TypeScriptファイルの変更を検知し、JavaScriptへコンパイルしてテーマディレクトリへ出力する
3. When ソースファイルが変更された時, the ビルドシステム shall ビルド済みアセットをWordPressテーマの所定ディレクトリへ直接出力する
4. The ビルドシステム shall 本番用ビルドコマンドを提供し、ミニファイ済みアセットを生成する
5. The ビルドシステム shall `vite.config.ts` 単一ファイルでビルド設定を完結させる

### Requirement 3: Wordmoveによるリモート同期
**Objective:** As a 開発者, I want Wordmoveでリモート環境のWordPressデータ（DB・uploads）をローカルへ同期したい, so that 本番/ステージングのコンテンツをローカルで確認・開発できる

#### Acceptance Criteria
1. When Wordmoveのpullコマンドを実行した時, the 同期ツール shall リモート環境のデータベースをローカル環境へ同期する
2. When Wordmoveのpullコマンドを実行した時, the 同期ツール shall リモート環境のuploadsディレクトリをローカルへ同期する
3. The 同期ツール shall `Movefile.yml` で接続先情報を管理し、環境変数で機密情報を外部化する
4. The 同期ツール shall Wordmoveをpull操作（リモート→ローカル）専用とし、pushによるデプロイを運用フローから除外する

### Requirement 4: GitHub Actionsによるデプロイ
**Objective:** As a 開発者, I want GitHub Actionsでコードをリモート環境へデプロイしたい, so that デプロイプロセスを自動化・標準化できる

#### Acceptance Criteria
1. When 指定ブランチへpushされた時, the CI/CDパイプライン shall 自動的にデプロイワークフローを実行する
2. The CI/CDパイプライン shall テーマファイルとビルド済みアセットをリモートサーバーへ転送する
3. The CI/CDパイプライン shall デプロイに必要な認証情報をGitHub Secretsで管理する
4. The CI/CDパイプライン shall ワークフロー定義を単一のYAMLファイルで管理する

### Requirement 5: プロジェクト構成とDX
**Objective:** As a 開発者, I want プロジェクト全体の構成をシンプルに保ちたい, so that 新規参加者が容易に開発を開始でき、保守性を維持できる

#### Acceptance Criteria
1. The プロジェクト shall ルートディレクトリに設定ファイル群（docker-compose.yml, vite.config.ts, Movefile.yml, package.json）を配置し、見通しの良い構成とする
2. The プロジェクト shall `.env` ファイルで環境固有の設定値を管理し、`.env` をバージョン管理から除外する
3. The プロジェクト shall SCSSソース、TypeScriptソース、WordPressテーマファイルを明確に分離したディレクトリ構造とする
4. The プロジェクト shall `package.json` のscriptsに主要操作（dev, build, pull等）を集約し、ワンコマンドで実行可能とする
