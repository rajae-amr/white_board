declare module 'react-katex' {
  import React from 'react';
  
  export interface KatexProps {
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    settings?: {
      displayMode?: boolean;
      throwOnError?: boolean;
      errorColor?: string;
      macros?: object;
      colorIsTextColor?: boolean;
      maxSize?: number;
      maxExpand?: number;
      strict?: boolean | string | Function;
      trust?: boolean | Function;
    };
  }
  
  export const InlineMath: React.FC<KatexProps>;
  export const BlockMath: React.FC<KatexProps>;
}
