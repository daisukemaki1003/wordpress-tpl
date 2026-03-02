# テンプレート vs 実プロジェクト（PMA Player）比較レポート

> 比較元: `wordpress-tpl`（テンプレート）
> 比較先: `pma_player_wp`（実プロジェクトでブラッシュアップ済み）
> 作成日: 2026-03-02

---

## 概要サマリー

実プロジェクトで運用した結果、テンプレートに **7つの重要な改善点** が見つかりました。
特に「テーマディレクトリ構造」「Vite HMR連携」「ビルド成果物の管理」の3つは **すぐに反映すべき致命的な差分** です。

| 重要度 | 項目 | 状態 |
|:---:|------|------|
| 🔴 | テーマディレクトリ構造 | テンプレートが壊れている |
| 🔴 | Vite HMR（Hot Module Replacement） | テンプレートに未実装 |
| 🔴 | ビルド成果物の Git 管理 | テンプレートの方針が非効率 |
| 🟡 | Docker 設定 | テンプレートに不足あり |
| 🟡 | デプロイワークフロー | テンプレートの設計が硬い |
| 🟢 | .env.example | 軽微な不足 |
| 🟢 | functions.php のモジュール属性 | テンプレートに未実装 |

---

## 1. テーマディレクトリ構造 🔴

テンプレートで最も大きな問題。ディレクトリ構造が不整合で、実際には動作しない箇所がある。

### テンプレート（現状）

```
wordpress-tpl/
├── src/                          # ソースコード
├── wordpress/
│   └── wp-content/
│       └── themes/
│           └── my-theme/         # テーマ本体
│               ├── assets/       # ← ビルド成果物をここに配置
│               │   ├── main.js
│               │   └── style.css
│               ├── functions.php
│               ├── index.php
│               └── style.css
└── vite.config.ts                # ← themes/tcs/dist に出力（不整合!）
```

**問題点:**
- `vite.config.ts` のビルド出力先が `themes/tcs/dist/` → テーマ名が `my-theme` と一致していない
- `functions.php` は `assets/` から読み込む → Vite は `dist/` に出力する → パスが合わない
- Docker は `wp-content/` 全体をマウント → テーマ以外も含まれて不必要に広い

### PMA Player（改善後）

```
pma_player_wp/
├── src/                          # ソースコード
├── theme/                        # テーマ本体（ルート直下でシンプル）
│   ├── dist/                     # ← Vite ビルド出力先（.gitignore済み）
│   │   ├── main.js
│   │   ├── style.css
│   │   └── hot                   # ← dev server 検知ファイル
│   ├── assets/
│   │   └── img/                  # 画像のみ
│   ├── functions.php
│   ├── header.php
│   ├── footer.php
│   ├── front-page.php
│   ├── index.php
│   └── style.css
└── vite.config.ts                # ← theme/dist に出力（整合性あり）
```

**改善ポイント:**
- `theme/` がルート直下 → パスがシンプルで把握しやすい
- Vite 出力先 = `theme/dist/` → `functions.php` の読み込みパスと一致
- Docker は `./theme` → WP テーマディレクトリに直接マウント（`${THEME_NAME}` で可変）

---

## 2. Vite HMR（Hot Module Replacement）🔴

テンプレートでは `hotFilePlugin` は存在するが、**PHP 側の対応が一切ない**ため HMR が機能しない。

### テンプレート（現状）の `functions.php`

```php
// 本番アセットを静的に読み込むだけ。hot ファイルの検知なし。
function mytheme_enqueue_assets(): void {
    $css_file = $theme_dir . '/assets/style.css';
    if (file_exists($css_file)) {
        wp_enqueue_style('mytheme-style', ...);
    }
    // JS も同様
}
```

### PMA Player（改善後）の `functions.php`

```php
function player_vite_enqueue(): void {
    $hot_file = get_theme_file_path('dist/hot');

    if (file_exists($hot_file)) {
        // ============================================
        // 開発モード: Vite dev server から直接読み込む
        // ============================================
        $dev_server_url = trim(file_get_contents($hot_file));

        wp_enqueue_script('vite-client', $dev_server_url . '/@vite/client', ...);
        wp_enqueue_script('player-style-dev', $dev_server_url . '/src/scss/style.scss', ...);
        wp_enqueue_script('player-main', $dev_server_url . '/src/ts/main.ts', ...);

        // type="module" 属性を付与
        add_filter('script_loader_tag', 'player_vite_module_attr', 10, 2);
    } else {
        // ============================================
        // 本番モード: dist/ のビルド済みアセットを読み込む
        // ============================================
        wp_enqueue_style('player-style', get_theme_file_uri('dist/style.css'), ...);
        wp_enqueue_script('player-main', get_theme_file_uri('dist/main.js'), ...);
        add_filter('script_loader_tag', 'player_vite_module_attr', 10, 2);
    }
}
```

**違いの要約:**

| 項目 | テンプレート | PMA Player |
|------|:---:|:---:|
| hot ファイル検知 | なし | あり |
| Vite dev server 直接読み込み | なし | あり |
| `@vite/client` (HMR) 読み込み | なし | あり |
| `type="module"` 属性付与 | なし | あり |
| SCSS/TS のソース直接参照（dev） | なし | あり |
| ファイル変更 → ブラウザ自動更新 | 不可 | 可能 |

---

## 3. ビルド成果物の Git 管理 🔴

### テンプレート（現状）

```gitignore
# .gitignore にビルド出力の除外がない
# → assets/main.js, assets/style.css がリポジトリにコミットされている
```

- ビルド成果物がリポジトリに含まれる
- マージ時にコンフリクトが発生しやすい
- ビルド忘れ or 古いビルドがデプロイされるリスク

### PMA Player（改善後）

```gitignore
# Vite build output
theme/dist/
```

- ビルド成果物は `.gitignore` で除外
- CI（GitHub Actions）で毎回 `npm run build` → rsync
- 常に最新のソースからビルドされることを保証

---

## 4. Docker 設定 🟡

### 4a. テーマのマウント方法

```yaml
# テンプレート: wp-content 全体をマウント（広すぎる）
volumes:
  - ./wordpress/wp-content:/var/www/html/wp-content

# PMA Player: テーマだけをピンポイントでマウント
volumes:
  - ./theme:/var/www/html/wp-content/themes/${THEME_NAME}
```

PMA Player の方が:
- テーマ以外（plugins, uploads 等）に影響しない
- `${THEME_NAME}` で環境変数によるテーマ名の切り替えが可能

### 4b. php.ini のカスタマイズ

```yaml
# テンプレート: なし

# PMA Player: PHP 設定のオーバーライド
volumes:
  - ./docker/php.ini:/usr/local/etc/php/conf.d/uploads.ini
```

```ini
# docker/php.ini
upload_max_filesize = 64M
post_max_size = 64M
```

WordPress で画像をアップロードする際、デフォルトの 2MB では不足する場合が多い。

### 4c. command の違い

```yaml
# テンプレート: chown コマンドを実行してからApache起動
command: >
  bash -c "chown www-data:www-data /var/www/html/wp-content && apache2-foreground"

# PMA Player: command なし（デフォルトのまま）
```

テンプレートの `chown` はテーマだけマウントする構成にすれば不要になる。

### 4d. Wordmove のマウントパス

```yaml
# テンプレート: wp-content 全体
- ./wordpress/wp-content:/html/wp-content

# PMA Player: テーマだけ（docker-compose と一貫）
- ./theme:/html/wp-content/themes/${THEME_NAME}
```

---

## 5. デプロイワークフロー（GitHub Actions）🟡

### トリガーの違い

```yaml
# テンプレート: PR マージ時に発火
on:
  pull_request:
    branches: [main]
    types: [closed]
jobs:
  deploy:
    if: github.event.pull_request.merged == true

# PMA Player: main への push で発火
on:
  push:
    branches: [main]
```

| 項目 | テンプレート | PMA Player |
|------|-------------|------------|
| トリガー | PR マージ | push to main |
| 直接 push 時 | デプロイされない | デプロイされる |
| 設定の複雑さ | やや複雑 | シンプル |

**考察:** テンプレートの PR マージ縛りは安全性が高いが、個人〜少人数開発では `push` トリガーのほうが実用的。

### SSH 接続の違い

```yaml
# テンプレート: SSH_HOST, SSH_USER を Secrets で管理（汎用的）
${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:${{ secrets.REMOTE_THEME_PATH }}/

# PMA Player: ホスト名・ユーザー名をハードコード + known_hosts を追加
ssh-keyscan -H v2002.coreserver.jp >> ~/.ssh/known_hosts
telepathy@v2002.coreserver.jp:${{ secrets.REMOTE_THEME_PATH }}/
```

| 項目 | テンプレート | PMA Player |
|------|:---:|:---:|
| SSH_HOST を Secrets 化 | あり | なし（ハードコード） |
| SSH_USER を Secrets 化 | あり | なし（ハードコード） |
| known_hosts 登録 | なし | あり |

**テンプレートとして望ましい姿:** Secrets で管理しつつ、`known_hosts` のステップを追加するのがベスト。

### rsync のソースパス

```yaml
# テンプレート
./wordpress/wp-content/themes/my-theme/

# PMA Player
./theme/
```

テーマディレクトリ構造の変更に連動。

---

## 6. .env.example 🟢

### 差分

```diff
+ # WordPress Theme
+ THEME_NAME=player
+
  # Database (Docker Compose)
  ...
```

PMA Player では `THEME_NAME` 環境変数が追加されている。
Docker と Wordmove でテーマ名を動的に参照するために必要。

---

## 7. functions.php の `type="module"` 属性 🟢

Vite は ESM（ES Modules）でバンドルするため、`<script>` タグに `type="module"` が必要。

```php
// PMA Player にのみ存在
function player_vite_module_attr(string $tag, string $handle): string {
    $module_handles = array('vite-client', 'player-style-dev', 'player-main');
    if (in_array($handle, $module_handles, true)) {
        $tag = str_replace(' src=', ' type="module" src=', $tag);
    }
    return $tag;
}
```

テンプレートにはこのフィルターがないため、Vite ビルドの JS が ESM として読み込まれない。

---

## 改善アクションリスト（テンプレートへの反映）

優先度順に整理:

### 必須（すぐに反映）

| # | アクション | 対象ファイル |
|---|-----------|-------------|
| 1 | テーマディレクトリを `theme/` に移動 | ディレクトリ構造全体 |
| 2 | `vite.config.ts` の出力先を `theme/dist/` に修正 | `vite.config.ts` |
| 3 | `functions.php` に Vite dev/prod 切り替えロジックを実装 | `theme/functions.php` |
| 4 | `functions.php` に `type="module"` フィルターを追加 | `theme/functions.php` |
| 5 | `theme/dist/` を `.gitignore` に追加 | `.gitignore` |
| 6 | コミット済みビルド成果物を削除 | `assets/main.js`, `assets/style.css` |

### 推奨（品質向上）

| # | アクション | 対象ファイル |
|---|-----------|-------------|
| 7 | `docker-compose.yml` をテーマ単体マウントに変更 | `docker-compose.yml` |
| 8 | `docker/php.ini` を追加（upload_max_filesize 対応） | 新規: `docker/php.ini` |
| 9 | `.env.example` に `THEME_NAME` を追加 | `.env.example` |
| 10 | `chown` command を削除 | `docker-compose.yml` |
| 11 | Wordmove のマウントパスをテーマ単体に変更 | `docker-compose.yml` |

### 検討（プロジェクトによる）

| # | アクション | 備考 |
|---|-----------|------|
| 12 | デプロイトリガーを `push` に変更するか検討 | チーム規模による |
| 13 | deploy.yml に `ssh-keyscan` ステップを追加 | known_hosts エラー防止 |
| 14 | deploy.yml の SSH 情報を Secrets に統一 | テンプレートは現状で OK |

---

## ファイル別 差分マトリクス

全ファイルの一覧と、どちらに存在するかの対照表:

| ファイル | テンプレート | PMA Player | 備考 |
|---------|:---:|:---:|------|
| `docker-compose.yml` | ✅ | ✅ | マウント方法が異なる |
| `docker/php.ini` | - | ✅ | テンプレートに不足 |
| `vite.config.ts` | ✅ | ✅ | 出力先パスが異なる |
| `tsconfig.json` | ✅ | ✅ | ほぼ同一 |
| `package.json` | ✅ | ✅ | PMA に lenis, scroll-hint あり |
| `.env.example` | ✅ | ✅ | PMA に THEME_NAME あり |
| `.gitignore` | ✅ | ✅ | PMA は dist/ を除外 |
| `Movefile.yml` | ✅ | ✅ | ほぼ同一 |
| `deploy.yml` | ✅ | ✅ | トリガー・パスが異なる |
| `verify-deploy.yml` | ✅ | ✅ | ほぼ同一 |
| **テーマ本体** | `wordpress/.../my-theme/` | `theme/` | 構造が根本的に異なる |
| `functions.php` | ✅（簡素） | ✅（完全） | HMR対応の有無 |
| `header.php` | - | ✅ | テンプレートに不足 |
| `footer.php` | - | ✅ | テンプレートに不足 |
| `front-page.php` | - | ✅ | プロジェクト固有 |
| `single-voice.php` | - | ✅ | プロジェクト固有 |
| `src/scss/` | ✅ | ✅ | PMA はページ固有のスタイルが充実 |
| `src/ts/` | ✅ | ✅ | PMA はコンポーネントが充実 |
