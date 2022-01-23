import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class GameService {
	constructor(private _http: HttpClient) {}

	getRandomWords(numberOfWords: number): Observable<string[]> {
		return this._http.get<string[]>('./assets/answers.json').pipe(
			map((words) => {
				const randomWords = [];

				while (randomWords.length <= 5) {
					randomWords.push(words.splice(Math.floor(Math.random() * words.length))[0]);
				}

				return randomWords;
			}),
		);
	}
}
