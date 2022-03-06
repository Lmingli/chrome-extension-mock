declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMeta {
  env: Record<string, unknown>
}
interface Window {
  diff_match_patch: DiffMatchPatch;
  DIFF_DELETE: number;
  DIFF_INSERT: number;
  DIFF_EQUAL: number;
}
