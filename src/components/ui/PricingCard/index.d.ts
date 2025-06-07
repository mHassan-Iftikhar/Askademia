export interface PricingCardProps {
    title: string;
    description: string;
    price?: number;
    hourlyRate?: {
        min: number;
        max: number
    };
    includes: string[]
}