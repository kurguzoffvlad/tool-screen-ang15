import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ITheme, ThemeLighthouse } from './theme.lighthouse';

/**
 * Директива автоматически добавляет суффикс с названием текущей темы к базовым классам элемента.
 *
 * Механизм работы:
 * 1. Принимает массив базовых CSS-классов через входное свойство `themeClass`
 * 2. Подписывается на поток текущей темы
 * 3. Формирует итоговые классы в формате: `{baseClassName}_{themeName}`
 * 4. Автоматически обновляет классы при изменении темы или базовых классов
 *
 * Пример использования:
 *
 * ```ts
 * evo.theme.send$({ name: 'white' }, 'AppComponent');
 * ```
 *
 * ```html
 * <div [themeClass]="['license-widget']"></div>
 * ```
 */
@Directive({
	selector: '[themeClass]',
})
export class ThemeClassDirective implements OnInit, OnDestroy {
	//region Properties
	private _baseClasses: string[] = [];

	/**
	 * Массив базовых CSS-классов, к которым будет добавлен суффикс темы.
	 * Пример: ['button', 'btn'] и тема 'dark' → 'button_dark' и 'btn_dark'.
	 */
	@Input()
	public set themeClass(value: string[] | null | undefined) {
		this._baseClasses = value ?? [];
		this._reapply();
	}

	public get themeClass(): string[] {
		return this._baseClasses;
	}

	/** Название текущей темы (последнее полученное значение). */
	private currentTheme: string | null = null;

	/**
	 * Ранее применённые темизированные классы.
	 * Нужны для корректного удаления при обновлении темы или базовых классов.
	 */
	private previousClassNames: string[] = [];

	private readonly destroyed$ = new Subject<void>();

	//endregion

	public constructor(
		private readonly elementRef: ElementRef<HTMLElement>,
		private readonly themeLighthouse: ThemeLighthouse,
	) {}

	//region Lifecycle hooks
	public ngOnInit(): void {
		this.themeLighthouse.lighthouse$
			.pipe(
				takeUntil(this.destroyed$),
				filter((theme): theme is ITheme => theme != null),
			)
			.subscribe((theme: ITheme) => {
				this.currentTheme = theme.name;
				this._reapply();
			});
	}

	public ngOnDestroy(): void {
		this.destroyed$.next();
		this.destroyed$.complete();
	}

	//endregion

	//region Private methods
	/**
	 * Полностью пересобирает темизированные классы на элементе:
	 * удаляет предыдущие и добавляет новые на основе текущей темы и базовых классов.
	 */
	private _reapply(): void {
		this._removePreviousClassNames();
		this._addNewClassNames();
	}

	/**
	 * Удаляет все ранее применённые темизированные классы из элемента.
	 */
	private _removePreviousClassNames(): void {
		if (this.previousClassNames.length === 0) {
			return;
		}

		const classList = this.elementRef.nativeElement.classList;

		for (const className of this.previousClassNames) {
			classList.remove(className);
		}

		this.previousClassNames = [];
	}

	/**
	 * Добавляет новые темизированные классы на основе текущей темы и базовых классов.
	 */
	private _addNewClassNames(): void {
		const theme = this.currentTheme;

		if (!theme || this._baseClasses.length === 0) {
			return;
		}

		const classList = this.elementRef.nativeElement.classList;

		for (const baseClass of this._baseClasses) {
			const themedClassName = `${baseClass}_${theme}`;
			classList.add(themedClassName);
			this.previousClassNames.push(themedClassName);
		}
	}

	//endregion
}
