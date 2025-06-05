// src/types/global.d.ts

// Extend the global Window interface to include gtag
// We use `any[]` for `...args` because gtag can take various argument types.
// The ESLint rule `no-explicit-any` might still flag this if it's super strict,
// but for global declarations like this, it's often the practical solution.
// If it still errors, you might need to add `// eslint-disable-next-line @typescript-eslint/no-explicit-any`
// above this line *in this file only*.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { gtag?: (...args: any[]) => void; }
}

// Define a general interface for your GA4 event parameters.
// This allows you to define specific properties for common parameters
// and allows for additional properties with `[key: string]: ...`
export interface GtagEventParams {
  [key: string]: string | number | boolean | undefined | null; // Allows common primitive types
  // Add specific common GA4 event parameters you might use
  event_category?: string;
  event_label?: string;
  value?: number;
  // Add your custom parameters that you've used in the events
  link_text?: string;
  link_url?: string;
  navigation_location?: string;
  category_name?: string;
  project_name?: string;
  form_name?: string;
  form_id?: string;
  // ... any other custom parameters you might add in the future
}

// This line is needed to make this a module file
// so that `declare global` works correctly.
export {};