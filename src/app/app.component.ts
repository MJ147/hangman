import { Component, HostListener, OnInit } from '@angular/core';
import { AnimationSegment, Circle, Path } from './models/animation';
import { GuessingLetter } from './models/letter';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
	gallows: AnimationSegment[] = [];
	stickman: AnimationSegment[] = [];

	guessingWord: GuessingLetter[] = [];

	readonly MAX_MISTAKES_NUMBER: number = 6;
	mistakesCounter: number = 0;

	@HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent) {
		this.onKeySelect(event.key);
	}

	ngOnInit(): void {
		this.prepareAnimation();
		this.prepareGuessingWord('jabłko');
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
				element: { d: 'M 90 56 l 0 20 M 90 60 l -15 10 M 90 60 l 15 10 M 75 93 l 15 -18 M 90 75 l -15 18 M 90 75 l 15 18' },
				isShow: false,
			},
		];
	}

	prepareGuessingWord(word: string): void {
		this.guessingWord = [...word].map((char) => ({ char: char.toUpperCase(), isShow: false }));
	}

	onKeySelect(key: string): void {
		let isGuessed = false;

		this.guessingWord.forEach((letter) => {
			if (letter.char === key.toUpperCase()) {
				isGuessed = true;
				letter.isShow = true;
			}
		});

		if (!isGuessed) {
			this.mistakesCounter =
				this.mistakesCounter + 1 > this.MAX_MISTAKES_NUMBER ? this.MAX_MISTAKES_NUMBER : this.mistakesCounter + 1;

			this.showGallowsSegment(this.mistakesCounter - 1);
			console.log(this.mistakesCounter);

			if (this.mistakesCounter === this.MAX_MISTAKES_NUMBER) {
				this.showStickman();

				setTimeout(() => {
					// this.gameOver();
				}, 1000);
			}
		}
	}

	showGallowsSegment(segmentNumber: number): void {
		this.gallows[segmentNumber].isShow = true;
	}

	showStickman(): void {
		this.stickman.forEach((segment) => (segment.isShow = true));
	}

	// gameOver(): void {

	// }

	getSegmentPath(segment: AnimationSegment): Path {
		return segment.element as Path;
	}

	getSegmentCircle(segment: AnimationSegment): Circle {
		return segment.element as Circle;
	}
}
