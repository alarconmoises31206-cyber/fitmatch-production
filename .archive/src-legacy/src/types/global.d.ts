// src/types/global.d.ts
// Global type declarations to reduce errors

// Declare modules for common JS libraries without types
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.css';
declare module '*.scss';

// Global variables (like those injected by Next.js)
declare var process: {
    env: {
        NODE_ENV: 'development' | 'production' | 'test';
        [key: string]: string | undefined;
    };
};

// Reduce strictness for JS files
interface Window {
    [key: string]: any;
}
