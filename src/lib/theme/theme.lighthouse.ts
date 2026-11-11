/** Маяк для оповещения о теме страницы */
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { TNullable } from '../models/screen.interfaces';
import { green } from "tool-log";

export interface ITheme {
	name: string;
}

/**
 * Отправка информации о теме приложения.
 *
 * @example
 * 	public constructor(
 * 		private readonly themeLighthouse: ThemeLighthouse
 * 	){}
 *
 * this.themeLighthouse.send$(
 * {
 *     name: 'dark',
 * }, 'AppComponent');
 */
@Injectable({
	providedIn: 'root',
})
export class ThemeLighthouse {
	public readonly lighthouse$ = new BehaviorSubject<TNullable<ITheme>>(null);

	public send$(value: ITheme, from: string = 'Не указано'): void {
		if (!value) { return; }

		green(`ThemeLighthouse send$ from ${from}`, { value })

		this.lighthouse$.next(value);
	}

	public getValue(): TNullable<ITheme> {
		return this.lighthouse$.getValue();
	}
}
