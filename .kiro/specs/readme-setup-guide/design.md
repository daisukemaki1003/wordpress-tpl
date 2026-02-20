# Design Document: readme-setup-guide

## Overview

**Purpose**: WordPress開発テンプレートプロジェクトの環境構築手順をREADME.mdとして提供し、新規開発者がリポジトリのクローンからローカル開発開始までを自力で完了できるようにする。

**Users**: 新規参加する開発者、およびコマンドリファレンスとして参照する既存開発者。

### Goals
- 新規開発者がREADMEのみで環境構築を完了できる
- 日常の開発コマンドをクイックリファレンスとして参照できる
- プロジェクト構成・デプロイ・環境変数の全情報を一元化する

### Non-Goals
- 各ツール（Docker, Vite, Wordmove）の詳細な使い方の解説
- トラブルシューティングガイドの網羅的な記載
- 英語版READMEの同時作成

## Architecture

### Architecture Pattern & Boundary Map

本フィーチャーは単一のMarkdownファイル（README.md）の新規作成であり、アーキテクチャ上の変更はない。

**Architecture Integration**:
- **選定パターン**: 単一ファイルドキュメント — README.mdをプロジェクトルートに配置
- **既存パターンの維持**: プロジェクトのフラット構成に従い、ルート直下に配置

### Technology Stack

| Layer | Choice / Version | Role in Feature | Notes |
|-------|------------------|-----------------|-------|
| ドキュメント | Markdown (GitHub Flavored) | README.mdの記述形式 | GitHubでの自動レンダリングに対応 |

## Requirements Traceability

| Requirement | Summary | Components | Interfaces | Flows |
|-------------|---------|------------|------------|-------|
| 1.1 | プロジェクト名と概要 | ReadmeDocument | — | — |
| 1.2 | 技術スタック一覧 | ReadmeDocument | — | — |
| 1.3 | 前提条件 | ReadmeDocument | — | — |
| 2.1 | クローンから起動までの手順 | ReadmeDocument | — | — |
| 2.2 | .env設定手順 | ReadmeDocument | — | — |
| 2.3 | npm install手順 | ReadmeDocument | — | — |
| 2.4 | docker compose up手順 | ReadmeDocument | — | — |
| 3.1 | npm run dev手順 | ReadmeDocument | — | — |
| 3.2 | npm run build手順 | ReadmeDocument | — | — |
| 3.3 | Wordmove同期手順 | ReadmeDocument | — | — |
| 4.1 | ディレクトリツリー | ReadmeDocument | — | — |
| 4.2 | ディレクトリ・ファイル役割説明 | ReadmeDocument | — | — |
| 5.1 | GitHub Actionsデプロイ説明 | ReadmeDocument | — | — |
| 5.2 | GitHub Secrets一覧 | ReadmeDocument | — | — |
| 6.1 | 環境変数テーブル | ReadmeDocument | — | — |
| 6.2 | 変数カテゴリ分類 | ReadmeDocument | — | — |

## Components and Interfaces

| Component | Domain/Layer | Intent | Req Coverage | Key Dependencies | Contracts |
|-----------|-------------|--------|--------------|-----------------|-----------|
| ReadmeDocument | Documentation | 環境構築手順と開発リファレンスの提供 | 1.1-6.2 | .env.example, package.json, vite.config.ts | — |

### Documentation

#### ReadmeDocument

| Field | Detail |
|-------|--------|
| Intent | README.mdとして環境構築手順・開発コマンド・プロジェクト構成を一元的に記載する |
| Requirements | 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2 |

**Responsibilities & Constraints**
- プロジェクトルートに `README.md` として配置
- GitHub Flavored Markdownで記述
- 日本語で記載（spec.json の language: ja に準拠）

**Dependencies**
- External: .env.example — 環境変数のテンプレート情報源 (P0)
- External: package.json — npm scriptsの定義情報源 (P0)
- External: wp-dev-environment/design.md — アーキテクチャ参考情報 (P2)

**Contracts**: なし（静的ドキュメント）

**Implementation Notes**
- README.mdのセクション構成は以下の順序とする:

```markdown
# プロジェクト名

## 概要
<!-- Req 1.1: プロジェクト名と概要説明 -->

## 技術スタック
<!-- Req 1.2: 使用技術の一覧 -->

## 前提条件
<!-- Req 1.3: Docker, Node.js等の必要ソフトウェア -->

## セットアップ
<!-- Req 2.1-2.4: クローンから起動までの順序付き手順 -->

## 開発
<!-- Req 3.1-3.2: dev, buildコマンド -->

## リモート同期
<!-- Req 3.3: Wordmove pull コマンド -->

## ディレクトリ構成
<!-- Req 4.1-4.2: ツリー形式 + 役割説明 -->

## デプロイ
<!-- Req 5.1-5.2: GitHub Actions + Secrets一覧 -->

## 環境変数
<!-- Req 6.1-6.2: カテゴリ別テーブル -->
```

- コマンドはすべてコードブロック（```bash）で記載する
- 環境変数はテーブル形式（| 変数名 | 説明 | デフォルト値 |）で記載する
- ディレクトリ構成はコードブロック内のツリー形式で記載する
- 実際の値は .env.example および package.json から正確に転記する

## Testing Strategy

### 手動検証項目
- README.mdがGitHubでレンダリングされ、全セクションが正しく表示される
- コードブロック内のコマンドがコピー＆ペーストで実行可能である
- .env.exampleの全変数が環境変数セクションに網羅されている
- package.jsonの全scriptsが開発セクションに記載されている
- ディレクトリ構成が実際のプロジェクト構造と一致している
