import { InfoDialogData } from './models/info-dialog-data';
import { InfoPopupComponent } from './components/info-popup/info-popup.component';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AnimationSegment, Circle, Path } from './models/animation';
import { GuessingLetter } from './models/letter';
import * as moment from 'moment';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
	readonly MAX_MISTAKES_NUMBER: number = 6;
	readonly MAX_LEVEL: number = 5;

	gallows: AnimationSegment[] = [];
	stickman: AnimationSegment[] = [];

	guessingWordAsString: string = 'jabłko';
	guessingWord: GuessingLetter[] = [];
	usedLetters: GuessingLetter[] = [];

	mistakesCounter: number = 0;
	level: number = 1;

	timerValue: number = 0; // in seconds
	timerInterval: ReturnType<typeof setInterval> | null = null;

	constructor(private _matDialog: MatDialog) {}

	@HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent) {
		if (!event.code.includes('Key') || this._matDialog.openDialogs.length) {
			return;
		}

		this.onKeySelect(event.key.toUpperCase());
	}

	ngOnInit(): void {
		this.prepareAnimation();
		this.prepareGuessingWord(this.guessingWordAsString);
		this.startTimer();
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

	prepareGuessingWord(word: string): void {
		this.guessingWord = [...word].map((char) => ({ char: char.toUpperCase(), isShow: false }));
	}

	onKeySelect(key: string): void {
		if (this.mistakesCounter === this.MAX_MISTAKES_NUMBER || this.usedLetters.some((letter) => letter.char === key)) {
			return;
		}

		const isLetterGuessed = this.isLetterGuessed(key);
		const usedLetter: GuessingLetter = { char: key, isShow: isLetterGuessed };
		this.usedLetters.push(usedLetter);

		if (!isLetterGuessed) {
			this.mistakesCounter =
				this.mistakesCounter + 1 > this.MAX_MISTAKES_NUMBER ? this.MAX_MISTAKES_NUMBER : this.mistakesCounter + 1;

			this.showGallowsSegment(this.mistakesCounter - 1);

			if (this.mistakesCounter === this.MAX_MISTAKES_NUMBER) {
				this.showStickman();

				// show game over hangman after 1 sec
				setTimeout(() => {
					this.gameOver();
				}, 1000);
			}
		} else if (
			this.guessingWord.every((letter) => {
				return letter.isShow;
			})
		) {
			this.endLevel();
		}
	}

	isLetterGuessed(key: string): boolean {
		let isGuessed = false;

		this.guessingWord.forEach((letter) => {
			if (letter.char === key.toUpperCase()) {
				isGuessed = true;
				letter.isShow = true;
			}
		});

		return isGuessed;
	}

	showGallowsSegment(segmentNumber: number): void {
		this.gallows[segmentNumber].isShow = true;
	}

	showStickman(): void {
		this.stickman.forEach((segment) => (segment.isShow = true));
	}

	gameOver(): void {
		this.pauseTimer();

		(this.stickman[0].element as Circle) = { cx: 95, cy: 50, r: 8 };
		(this.stickman[2].element as Path).d = 'M 90 60 l -7 17';
		(this.stickman[3].element as Path).d = 'M 90 60 l 7 17';
		(this.stickman[4].element as Path).d = 'M 90 75 l -7 23';
		(this.stickman[5].element as Path).d = 'M 90 75 l 7 24';

		const dialogPopup: InfoDialogData = {
			title: 'Przegrałeś',
			content: `Szukane słowo to: ${this.guessingWordAsString}`,
			buttonText: 'Spróbuj ponownie',
		};

		this.openPopup(dialogPopup)
			.afterClosed()
			.subscribe(() => {
				this.resetGame();
			});
	}

	endLevel(): void {
		this.pauseTimer();

		const isLastLvl = this.level === this.MAX_LEVEL;
		let dialogPopup = {} as InfoDialogData;

		if (isLastLvl) {
			dialogPopup = {
				title: 'Wygrałeś!',
				content: `Zajeło ci to ${moment.utc(this.timerValue * 1000).format('mm:ss')}`,
				buttonText: 'Zagraj jeszcze raz',
			};
		} else {
			dialogPopup = {
				title: 'Brawo!',
				content: 'Możesz przejść do kolejnego poziomu.',
				buttonText: `Poziom ${++this.level}`,
			};
		}

		this.openPopup(dialogPopup)
			.afterClosed()
			.subscribe(() => {
				this.resetGame(!isLastLvl);
			});
	}

	openPopup(popupData: InfoDialogData): MatDialogRef<InfoPopupComponent, InfoDialogData> {
		return this._matDialog.open<InfoPopupComponent, InfoDialogData>(InfoPopupComponent, {
			data: { title: popupData.title, content: popupData.content, buttonText: popupData.buttonText },
			autoFocus: false,
			position: { top: '50px' },
			disableClose: true,
		});
	}

	resetGame(isNewLvl: boolean = false): void {
		this.prepareAnimation();
		this.prepareGuessingWord(this.guessingWordAsString);
		this.mistakesCounter = 0;
		this.usedLetters = [];

		if (!isNewLvl) {
			this.clearTimer();
			this.level = 1;
		}

		this.startTimer();
	}

	getSegmentPath(segment: AnimationSegment): Path {
		return segment.element as Path;
	}

	getSegmentCircle(segment: AnimationSegment): Circle {
		return segment.element as Circle;
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

	onStickmanHelp(): void {
		(this.stickman[0].element as Circle) = { cx: 90, cy: 48, r: 8 };
		(this.stickman[2].element as Path).d = 'M 90 60 l -15 -10';
		(this.stickman[3].element as Path).d = 'M 90 60 l 15 -10';
		(this.stickman[4].element as Path).d = 'M 75 93 l 15 -18';
		(this.stickman[5].element as Path).d = 'M 90 75 l 15 18';
	}

	startTimer(): void {
		this.timerInterval = setInterval(() => {
			this.timerValue++;
		}, 1000);
	}

	pauseTimer(): void {
		if (this.timerInterval != null) {
			clearInterval(this.timerInterval);
		}
	}

	clearTimer(): void {
		this.pauseTimer();
		this.timerValue = 0;
	}
}
