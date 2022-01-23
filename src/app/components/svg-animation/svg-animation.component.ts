import { StickmanState } from './../../enum/stickman-state.enum';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnimationSegment, Circle, Path } from 'src/app/models/animation';

@Component({
	selector: 'app-svg-animation',
	templateUrl: './svg-animation.component.html',
	styleUrls: ['./svg-animation.component.less'],
})
export class SvgAnimationComponent implements OnInit {
	gallows: AnimationSegment[] = [];
	stickman: AnimationSegment[] = [];

	@Input() set mistakesCounter(mistakesCounter: number) {
		this.showGallowsSegment(mistakesCounter - 1);
	}
	@Input() set stickmanState(state: StickmanState | null) {
		if (state != null) {
			this.toggleStickmanState(state);
		}
	}
	@Output() stickmanRescue: EventEmitter<void> = new EventEmitter<void>();

	constructor(private _matDialog: MatDialog) {}

	ngOnInit(): void {
		this.prepareAnimation();
		console.log(1, this.gallows);
	}

	prepareAnimation(): void {
		this.gallows = [
			{
				element: { d: 'M 0 110 l 25 -30' },
				isShow: false,
			},
			{
				element: { d: 'M 25 80 l 25 30' },
				isShow: false,
			},
			{
				element: { d: 'M 25 80 l 0 -70' },
				isShow: false,
			},
			{
				element: { d: 'M 25 10 l 65 0' },
				isShow: false,
			},
			{
				element: { d: 'M 25 30 l 20 -20' },
				isShow: false,
			},
			{
				element: { d: 'M 90 10 l 0 30' },
				isShow: false,
			},
		];

		this.stickman = [
			{
				element: { cx: 90, cy: 48, r: 8 },
				isShow: false,
			},
			{
				element: { d: 'M 90 56 l 0 20' },
				isShow: false,
			},
			{
				element: { d: 'M 90 60 l -15 10' },
				isShow: false,
			},
			{
				element: { d: 'M 90 60 l 15 10' },
				isShow: false,
			},
			{
				element: { d: 'M 75 93 l 15 -18' },
				isShow: false,
			},
			{
				element: { d: 'M 90 75 l 15 18' },
				isShow: false,
			},
		];
	}

	toggleStickmanState(state: StickmanState): void {
		switch (state) {
			case StickmanState.Live:
				this.setStickmanLive();
				break;

			case StickmanState.Dead:
				this.setStickmanDead();
				break;

			case StickmanState.Rescue:
				this.onStickmanRescue();
				break;

			default:
				break;
		}
	}

	setStickmanLive(): void {
		(this.stickman[0].element as Circle) = { cx: 90, cy: 48, r: 8 };
		(this.stickman[2].element as Path).d = 'M 90 60 l -15 10';
		(this.stickman[3].element as Path).d = 'M 90 60 l 15 10';
		(this.stickman[4].element as Path).d = 'M 75 93 l 15 -18';
		(this.stickman[5].element as Path).d = 'M 90 75 l 15 18';
	}

	setStickmanDead(): void {
		(this.stickman[0].element as Circle) = { cx: 95, cy: 50, r: 8 };
		(this.stickman[2].element as Path).d = 'M 90 60 l -7 17';
		(this.stickman[3].element as Path).d = 'M 90 60 l 7 17';
		(this.stickman[4].element as Path).d = 'M 90 75 l -7 23';
		(this.stickman[5].element as Path).d = 'M 90 75 l 7 24';
	}

	onStickmanRescue(): void {
		(this.stickman[0].element as Circle) = { cx: 90, cy: 63, r: 8 };
		(this.stickman[1].element as Path).d = 'M 90 71 l 0 20';
		(this.stickman[2].element as Path).d = 'M 90 77 l -15 -10';
		(this.stickman[3].element as Path).d = 'M 90 77 l 15 -10';
		(this.stickman[4].element as Path).d = 'M 75 108 l 15 -18';
		(this.stickman[5].element as Path).d = 'M 90 90 l 15 18';

		// wait 1s to show win popup
		this._matDialog.closeAll();
		setTimeout(() => {
			this.stickmanRescue.emit();
		}, 1000);
	}

	showGallowsSegment(segmentNumber: number): void {
		if (segmentNumber < 0) {
			this.prepareAnimation();
		}

		this.gallows[segmentNumber].isShow = true;
		if (this.gallows.length - 1 === segmentNumber) {
			this.showStickman();
		}
	}

	showStickman(): void {
		this.stickman.forEach((segment) => (segment.isShow = true));
	}

	getSegmentPath(segment: AnimationSegment): Path {
		return segment.element as Path;
	}

	getSegmentCircle(segment: AnimationSegment): Circle {
		return segment.element as Circle;
	}
}
