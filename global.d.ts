declare global {
    interface Window {
        customCards?: Array<{
            type: string;
            name: string;
            preview?: boolean;
            description?: string;
        }>;
    }
}

export {}