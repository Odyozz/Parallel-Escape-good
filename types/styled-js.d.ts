// types/styled-js.d.ts

declare module 'styled-jsx' {
  import type { CSSProperties } from 'styled-js';
  export interface StyledJsxAttributes extends CSSProperties {
    jsx?: any;
  }
}
