export interface AnimationSegment {
	element: Path | Circle;
	isShow: boolean;
}

export interface Path {
	d: string;
}

export interface Circle {
	cx: number;
	cy: number;
	r: number;
}
