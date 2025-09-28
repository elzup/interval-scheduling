# interval-scheduler パッケージ仕様書

## 📋 **概要**

`interval-scheduler`は、区間スケジューリング問題を効率的に解決する TypeScript/JavaScript ライブラリです。会議室予約、リソース配分、タスクスケジューリングなどの実用的な問題に対応します。

## 🎯 **主要機能**

- **区間スケジューリング**: 重複しない区間を複数列に効率的に配置
- **複数戦略**: 貪欲法、最適化法、バランス法から選択可能
- **型安全性**: 完全な TypeScript サポート
- **高パフォーマンス**: O(n log n)の時間計算量
- **柔軟性**: カスタムオブジェクトからの変換機能

## 📦 **パッケージ情報**

```json
{
  "name": "interval-scheduler",
  "version": "1.0.0",
  "description": "Efficient interval scheduling and optimization algorithms with TypeScript support",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "keywords": [
    "interval",
    "scheduling",
    "algorithm",
    "optimization",
    "greedy",
    "typescript",
    "resource-allocation",
    "timeline"
  ],
  "author": "elzup",
  "license": "MIT"
}
```

## 🏗 **プロジェクト構成**

spec.md に基づいて

```
interval-scheduler/
├── package.json
├── README.md
├── LICENSE
├── tsconfig.json
├── jest.config.js
├── .gitignore
├── .npmignore
├── src/
│   ├── index.ts              # メインエントリーポイント
│   ├── types.ts              # 型定義
│   ├── core/
│   │   ├── scheduler.ts      # 核となるスケジューリング機能
│   │   ├── strategies/       # 各種アルゴリズム戦略
│   │   │   ├── greedy.ts     # 貪欲法
│   │   │   ├── optimized.ts  # 最適化法
│   │   │   └── balanced.ts   # バランス法
│   │   └── utils.ts          # ユーティリティ関数
│   └── __tests__/
│       ├── scheduler.test.ts
│       ├── strategies.test.ts
│       ├── performance.test.ts
│       └── integration.test.ts
├── lib/                      # ビルド出力
│   ├── cjs/                 # CommonJS
│   ├── esm/                 # ES Modules
│   └── types/               # 型定義ファイル
├── benchmarks/
│   └── performance.js
├── docs/
│   ├── api.md
│   └── examples.md
└── examples/
    ├── basic-usage.js
    ├── meeting-rooms.js
    └── resource-allocation.js
```

## 🎨 **API 設計**

### 型定義 (`src/types.ts`)

```typescript
export type Comparable = string | number | Date

export interface ScheduleItem<T = unknown, K extends Comparable = number> {
  readonly id: T
  readonly start: K
  readonly end: K
}

export interface SchedulingResult<T> {
  readonly columns: ReadonlyArray<ReadonlyArray<T>>
  readonly totalColumns: number
  readonly efficiency: number // 利用率 (0-1)
  readonly metadata: {
    readonly strategy: string
    readonly processingTime: number // ms
    readonly inputSize: number
  }
}

export interface SchedulingOptions {
  readonly strategy?: 'greedy' | 'optimized' | 'balanced'
  readonly maxColumns?: number
  readonly allowOverlap?: boolean
  readonly sortBy?: 'start' | 'end' | 'duration'
}

export interface ValidationError {
  readonly type: 'INVALID_INTERVAL' | 'NEGATIVE_DURATION' | 'MISSING_FIELD'
  readonly message: string
  readonly itemIndex: number
}
```

### メイン API (`src/index.ts`)

```typescript
// 型定義のエクスポート
export {
  ScheduleItem,
  SchedulingResult,
  SchedulingOptions,
  ValidationError,
  Comparable,
} from './types'

// 核となる関数
export {
  schedule,
  scheduleBy,
  scheduleOptimized,
  scheduleBalanced,
} from './core/scheduler'

// ユーティリティ関数
export {
  validateIntervals,
  mergeIntervals,
  calculateEfficiency,
  intervalOverlap,
} from './core/utils'

// 後方互換性のためのエイリアス
export {
  schedule as scheduling,
  scheduleOptimized as schedulingEase,
  scheduleBy as schedulingBy,
} from './core/scheduler'
```

### 核となるスケジューラー (`src/core/scheduler.ts`)

```typescript
/**
 * 基本的な区間スケジューリング
 * @param items - スケジュール対象のアイテム配列
 * @param options - スケジューリングオプション
 * @returns スケジューリング結果
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */
export function schedule<T, K extends Comparable = number>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  options: SchedulingOptions = {}
): SchedulingResult<T>

/**
 * カスタムオブジェクトからのスケジューリング
 * @param items - 元のオブジェクト配列
 * @param mapper - ScheduleItemへの変換関数
 * @param options - スケジューリングオプション
 * @returns 元のオブジェクトでのスケジューリング結果
 */
export function scheduleBy<T, K extends Comparable = number>(
  items: ReadonlyArray<T>,
  mapper: (item: T, index: number) => ScheduleItem<string, K>,
  options: SchedulingOptions = {}
): SchedulingResult<T>

/**
 * 最適化されたスケジューリング（最小列数を目指す）
 */
export function scheduleOptimized<T, K extends Comparable = number>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  options: Omit<SchedulingOptions, 'strategy'> = {}
): SchedulingResult<T>

/**
 * バランス重視のスケジューリング（列間の均等分散）
 */
export function scheduleBalanced<T, K extends Comparable = number>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  options: Omit<SchedulingOptions, 'strategy'> = {}
): SchedulingResult<T>
```

## 🔧 **各種戦略の実装**

### 1. 貪欲法 (`src/core/strategies/greedy.ts`)

```typescript
/**
 * 貪欲法によるスケジューリング
 * 終了時刻の早い順に配置する古典的なアルゴリズム
 */
export function greedySchedule<T, K extends Comparable>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  maxColumns: number = Infinity
): SchedulingResult<T>
```

### 2. 最適化法 (`src/core/strategies/optimized.ts`)

```typescript
/**
 * 最適化されたスケジューリング
 * より少ない列数での配置を試行
 */
export function optimizedSchedule<T, K extends Comparable>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  options: OptimizedOptions = {}
): SchedulingResult<T>
```

### 3. バランス法 (`src/core/strategies/balanced.ts`)

```typescript
/**
 * バランス重視のスケジューリング
 * 列間の負荷を均等に分散
 */
export function balancedSchedule<T, K extends Comparable>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  options: BalancedOptions = {}
): SchedulingResult<T>
```

## 🛠 **ユーティリティ関数**

### バリデーション (`src/core/utils.ts`)

```typescript
/**
 * 区間の妥当性検証
 */
export function validateIntervals<T, K extends Comparable>(
  items: ReadonlyArray<ScheduleItem<T, K>>
): ValidationError[]

/**
 * 重複する区間のマージ
 */
export function mergeIntervals<T, K extends Comparable>(
  items: ReadonlyArray<ScheduleItem<T, K>>
): ScheduleItem<T, K>[]

/**
 * 効率性の計算
 */
export function calculateEfficiency<T>(
  columns: ReadonlyArray<ReadonlyArray<T>>,
  totalDuration: number
): number

/**
 * 2つの区間の重複チェック
 */
export function intervalOverlap<K extends Comparable>(
  a: Pick<ScheduleItem<unknown, K>, 'start' | 'end'>,
  b: Pick<ScheduleItem<unknown, K>, 'start' | 'end'>
): boolean
```

## 📊 **使用例**

### 基本的な使用例

```typescript
import { schedule, ScheduleItem } from 'interval-scheduler'

const meetings: ScheduleItem<string>[] = [
  { id: 'meeting-a', start: 9, end: 11 },
  { id: 'meeting-b', start: 10, end: 12 },
  { id: 'meeting-c', start: 11, end: 13 },
]

const result = schedule(meetings)
console.log(result.columns)
// [['meeting-a', 'meeting-c'], ['meeting-b']]
```

### カスタムオブジェクトでの使用例

```typescript
import { scheduleBy } from 'interval-scheduler'

interface Meeting {
  title: string
  startTime: Date
  endTime: Date
}

const meetings: Meeting[] = [
  {
    title: '朝礼',
    startTime: new Date('2024-01-01T09:00'),
    endTime: new Date('2024-01-01T09:30'),
  },
  {
    title: '企画会議',
    startTime: new Date('2024-01-01T09:15'),
    endTime: new Date('2024-01-01T10:15'),
  },
]

const result = scheduleBy(meetings, (meeting) => ({
  id: meeting.title,
  start: meeting.startTime.getTime(),
  end: meeting.endTime.getTime(),
}))
```

### 最適化オプション

```typescript
const result = schedule(meetings, {
  strategy: 'optimized',
  maxColumns: 3,
  sortBy: 'duration',
})

console.log(`使用列数: ${result.totalColumns}`)
console.log(`効率性: ${(result.efficiency * 100).toFixed(1)}%`)
```

## 🚀 **パフォーマンス目標**

| データサイズ | 処理時間目標 | メモリ使用量 |
| ------------ | ------------ | ------------ |
| 100 項目     | < 1ms        | < 1MB        |
| 1,000 項目   | < 10ms       | < 5MB        |
| 10,000 項目  | < 100ms      | < 50MB       |
| 100,000 項目 | < 1s         | < 500MB      |

## 🧪 **テスト戦略**

### テストカテゴリー

1. **ユニットテスト**

   - 各戦略の基本動作
   - エッジケース（空配列、単一要素など）
   - エラーハンドリング

2. **統合テスト**

   - API 間の連携
   - 型安全性の検証

3. **パフォーマンステスト**

   - 大量データでのベンチマーク
   - メモリリーク検証

4. **互換性テスト**
   - Node.js 環境
   - ブラウザ環境
   - 各種 TypeScript バージョン

### カバレッジ目標

- **行カバレッジ**: 95%以上
- **分岐カバレッジ**: 90%以上
- **関数カバレッジ**: 100%

## 📋 **ビルド・デプロイ設定**

### TypeScript 設定

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "lib": ["ES2018"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./lib",
    "rootDir": "./src",
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ビルドスクリプト

```json
{
  "scripts": {
    "build": "npm run clean && npm run build:cjs && npm run build:esm && npm run build:types",
    "build:cjs": "tsc --module commonjs --outDir lib/cjs",
    "build:esm": "tsc --module esnext --outDir lib/esm",
    "build:types": "tsc --declaration --emitDeclarationOnly --outDir lib/types",
    "clean": "rimraf lib",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "benchmark": "node benchmarks/performance.js",
    "docs": "typedoc src/index.ts",
    "prepublishOnly": "npm run build && npm test"
  }
}
```

## 📈 **リリース計画**

### v1.0.0 - MVP

- [x] 基本的なスケジューリング機能
- [x] 貪欲法の実装
- [x] TypeScript 対応
- [x] 基本的なテスト

### v1.1.0 - 最適化

- [ ] 最適化されたアルゴリズム
- [ ] パフォーマンス改善
- [ ] より詳細なテスト

### v1.2.0 - 機能拡張

- [ ] バランス法の実装
- [ ] カスタム比較関数サポート
- [ ] より柔軟なオプション

### v2.0.0 - 高度な機能

- [ ] 重み付きスケジューリング
- [ ] 制約付きスケジューリング
- [ ] WebAssembly 対応（大規模データ用）

## 🎯 **成功指標**

### 技術指標

- **ダウンロード数**: 月 1,000 ダウンロード
- **GitHub スター**: 50 スター
- **バグレポート**: 月 5 件未満

### 品質指標

- **テストカバレッジ**: 95%以上維持
- **TypeScript 厳密性**: strict mode 完全対応
- **パフォーマンス**: 上記目標を維持

### コミュニティ指標

- **コントリビューター**: 3 名以上
- **Issue 解決率**: 90%以上
- **ドキュメント満足度**: 4.0/5.0 以上

## 📚 **依存関係**

### 開発依存関係のみ

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "typedoc": "^0.24.0",
    "rimraf": "^5.0.0"
  }
}
```

### ランタイム依存関係なし

- 外部ライブラリに依存しない軽量実装
- Tree-shaking に完全対応

---

**作成日**: 2025 年 9 月 28 日  
**作成者**: elzup  
**バージョン**: 1.0  
**最終更新**: 2025 年 9 月 28 日
