export interface SpecialtyDetailProps {
	description: string;
	image: string;
}

export interface SpecialtyProps {
	[key: string]: SpecialtyDetailProps;
}
