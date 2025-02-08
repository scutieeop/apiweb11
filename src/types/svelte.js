/**
 * @typedef {Object} ComponentConstructorOptions
 * @property {Element | Document | ShadowRoot} target - Bileşenin mount edileceği hedef element
 * @property {Element} [anchor] - Bileşenin yerleştirileceği referans noktası
 * @property {Object} [props] - Bileşene geçilecek props
 * @property {Map<any, any>} [context] - Bileşen context'i
 * @property {boolean} [hydrate] - Hydration modu
 * @property {boolean} [intro] - Intro animasyonları
 * @property {boolean} [$$inline] - İç kullanım
 */

/**
 * @template {Record<string, any>} Props
 * @typedef {Object} Component
 * @property {(props: Partial<Props>) => void} $set - Props'ları günceller
 * @property {<T = any>(event: string, callback: (event: CustomEvent<T>) => void) => () => void} $on - Event dinleyici ekler
 * @property {() => void} $destroy - Bileşeni yok eder
 */

/**
 * @template {Record<string, any>} Props
 * @typedef {new (options: ComponentConstructorOptions) => Component<Props>} ComponentType
 */

export {}; 