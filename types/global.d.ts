// Global type declarations to fix TypeScript errors
declare module '*.css' {
    const content: { [className: string]: string }
    export default content;
}

declare module '*.scss' {
    const content: { [className: string]: string }
    export default content;
}

// Common missing types
type Nullable<T> = T | null;
type Optional<T> = T | undefined;

// Next.js types
interface Window {
    // Add any window properties if needed
}

// Process.env extensions
declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        NEXT_PUBLIC_SUPABASE_URL: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY: string;
        STRIPE_SECRET_KEY: string;
        STRIPE_WEBHOOK_SECRET: string;
        // Add other env variables as needed
    }
}
