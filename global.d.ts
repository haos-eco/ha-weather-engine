declare global {
    interface Window {
        customCards?: Array<{
            type: string;
            name: string;
            preview?: boolean;
            description?: string;
        }>;

        weatherSceneDebug: {
            card: WeatherSceneElement;
            simulations: Simulation[];
            applySimulation: (simulation: Simulation) => void;
            next: () => void;
            previous: () => void;
            play: () => void;
            stop: () => void;
            set: (simulation: Partial<Simulation>) => void;
        };
    }
}

export {}