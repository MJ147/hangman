import { GameService } from './services/game.service';
import { StickmanState } from './enum/stickman-state.enum';
import { InfoDialogData } from './models/info-dialog-data';
import { InfoPopupComponent } from './components/info-popup/info-popup.component';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GuessingLetter } from './models/letter';
import * as moment from 'moment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
	readonly MAX_MISTAKES_NUMBER: number = 6;
	readonly MAX_LEVEL: number = 5;

	guessingWords: string[] = [];
	guessingWord: GuessingLetter[] = [];
	usedLetters: GuessingLetter[] = [];

	mistakesCounter: number = 0;
	level: number = 1;

	timerValue: number = 0; // in seconds
	timerInterval: ReturnType<typeof setInterval> | null = null;

	stickmanState: StickmanState | null = null;

	constructor(private _matDialog: MatDialog, private _gameService: GameService) {}

	@HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent) {
		if (!event.code.includes('Key') || this._matDialog.openDialogs.length) {
			return;
		}

		this.onKeySelect(event.key.toUpperCase());
	}

	async ngOnInit(): Promise<void> {
		await this.loadGuessingWords();
		this.prepareGuessingWord(this.guessingWords[this.level - 1]);
		this.startTimer();
	}

	loadGuessingWords(): Promise<string[]> {
		return this._gameService
			.getRandomWords(this.level)
			.pipe(tap((words) => (this.guessingWords = words)))
			.toPromise();
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

			if (this.mistakesCounter === this.MAX_MISTAKES_NUMBER) {
				this.stickmanState = StickmanState.Live;

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

	gameOver(): void {
		this.pauseTimer();
		this.stickmanState = StickmanState.Dead;

		const dialogPopup: InfoDialogData = {
			title: 'Przegrałeś',
			content: `Szukane słowo to: ${this.guessingWords[this.level - 1]}`,
			buttonText: 'Spróbuj ponownie',
		};

		this.openPopup(dialogPopup)
			.afterClosed()
			.subscribe((value) => {
				if (value) {
					this.resetGame();
				}
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

	async resetGame(isNewLvl: boolean = false): Promise<void> {
		if (!isNewLvl) {
			await this.loadGuessingWords();
			this.clearTimer();
			this.level = 1;
		}

		this.prepareGuessingWord(this.guessingWords[this.level - 1]);
		this.mistakesCounter = 0;
		this.usedLetters = [];
		this.startTimer();
	}

	stickmanRescue(): void {
		this.level = 5;
		this.endLevel();
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
