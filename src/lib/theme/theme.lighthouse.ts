/** Маяк для оповещения о теме страницы */
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { TNullable } from '../models/screen.interfaces';
import { green } from "tool-log";

export interface ITheme {
	name: string;
	options?: {
		callback?: (bg: string) => void;
		bg: string;
	};
}

/**
 * Отправка информации о теме приложения.
 *
 * @example
 * const themeLighthouse = inject(ThemeLighthouse);
 *
 * themeLighthouse.send$({
 *     name: 'dark',
 *     options: {
 *         bg: '#1e1e1e',
 *         callback: (bg) => console.log('Фон:', bg),
 *     },
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
