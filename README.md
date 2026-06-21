# three-readme

Three.js シーンを README 埋め込み用のアニメ SVG（SMIL）に焼く CLI / GitHub Action です。platane/snk と同型の、生成した成果物をリポジトリへコミットする方式を採用しています。

## デモ

![torusknot](./assets/torusknot.svg)

`assets/torusknot.svg` は GitHub Action の初回実行まで存在しません。

## 仕組み

jsdom で Node.js 環境へ DOM を注入します。
three の `SVGRenderer` で各フレームを SVG に変換します。
one-hot opacity の SMIL `<animate>` で N フレームを単一 SVG にエンコードします。
最後に SVGO で保守的に最適化します。

## CLI の使い方

```bash
npm run render -- --scene torusknot --frames 24 --bg "#0d1117" --color "#39d353" --out assets/torusknot.svg
```

| フラグ | 既定値 | 説明 |
| --- | --- | --- |
| `--scene` | `torusknot` | 描画するシーン名（`torusknot` または `icosahedron`） |
| `--frames` | `24` | フレーム数（正の整数） |
| `--fps` | `12` | 1秒あたりのフレーム数 |
| `--width` | `480` | SVG の幅 |
| `--height` | `480` | SVG の高さ |
| `--color` | `#ffffff` | シーンへ渡す描画色 |
| `--bg` | `none` | 背景色。`none` で透過 |
| `--out` | `out/<scene>.svg` | 出力先 |

未知の `--key value` フラグは `params` としてシーンへ渡されます。`--color` も `params` 経由でシーンが使用します。

## シーンの追加方法

1. `src/scenes/<name>.ts` を作り、`SceneFactory`（`(params, ctx) => { scene, camera, update(frame, frameCount) }`）を default export ではなく名前付き export で実装します。`ctx` は `{ THREE, width, height }` です。色には `params.color` を使います。
2. `src/scenes/index.ts` でシーンを import し、`sceneRegistry` に登録します。
3. `npm run render -- --scene <name> --out assets/<name>.svg` で生成して確認します。

`src/scenes/torusknot.ts` と `src/scenes/icosahedron.ts` が実装例です。

## GitHub Action

`.github/workflows/render.yml` は、手動実行、毎週月曜の定期実行、または `main` への `src` などの変更を契機に SVG を再生成し、`assets/` へ自動コミットします。

自分のリポジトリで使う手順:

1. `.github/workflows/render.yml` をコピーします。
2. CLI の `--scene`、色、フレーム数、出力先などを編集します。
3. ワークフローに `permissions: contents: write` を設定し、Actions にコミット権限を与えます。

## README への貼り方

相対パスにキャッシュバスト用のクエリを付けます。

```markdown
![](./assets/torusknot.svg?v=1)
```

GitHub は SVG を camo プロキシ経由で配信し、強くキャッシュします。SVG の更新を README に反映したいときは、`?v=N` の N を増やしてください。

## 制約

- アニメーションは SMIL のみです。CSS の `<style>` や `@keyframes` は使いません。
- 約 12 fps、数百 KB 以内を目安にしてください。
