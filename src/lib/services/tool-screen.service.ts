import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    BehaviorSubject, Observable, Subject,
    auditTime, fromEvent, merge, takeUntil,
} from 'rxjs';

import { IDevices } from '../models/devices';
import { IScreenInfo } from '../models/screen.interfaces';
import { TOOL_SCREEN_CONFIG, IToolScreenConfig } from '../tokens/tool-screen.config';
import { ScreenDetectorService } from './screen-detector.service';

/**
 * Сервис состояния экрана.
 *
 * Хранит текущее состояние (`IScreenInfo`) в `BehaviorSubject`,
 * автоматически обновляет его при `resize`, изменении ориентации
 * и плотности пикселей (`devicePixelRatio`), а также позволяет
 * переопределить границы устройств (`phoneMaxSize` и т.д.) и
 * обновить состояние вручную.
 *
 * Сервис root-scoped: один экземпляр на всё приложение, `destroy()`
 * вызывать не нужно (метод оставлен для тестов/SSR).
 */
@Injectable({ providedIn: 'root' })
export class ToolScreenService {
    /** Конфиг: границы устройств и задержка debounce для resize. */
    private readonly _config = inject<IToolScreenConfig>(TOOL_SCREEN_CONFIG);

    /** Сервис-детектор, собирающий `IScreenInfo` из `window.*`. */
    private readonly _detector = inject(ScreenDetectorService);

    /** `true`, если код исполняется в браузере (а не в SSR/WebWorker). */
    private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    /** Поток для отписки от слушателей `window` при `destroy()`. */
    private readonly _destroy$ = new Subject<void>();

    /** Внутренний источник состояния экрана. */
    private readonly _state$$: BehaviorSubject<IScreenInfo>;

    /** Текущие границы устройств (можно менять через `setDevices`). */
    private _devices: IDevices = { ...this._config.devices };

    /** Публичный поток состояния экрана (read-only). */
    public readonly state$: Observable<IScreenInfo>;

    public constructor() {
        this._state$$ = new BehaviorSubject<IScreenInfo>(
            this._isBrowser
                ? this._detector.getScreen(this._devices)
                : this._detector.getEmptyScreen(this._devices),
        );

        this.state$ = this._state$$.asObservable();

        if (this._isBrowser) {
            this.listenToResize();
        }
    }

    /** Текущее значение состояния экрана (синхронный снимок). */
    public get state(): IScreenInfo {
        return this._state$$.getValue();
    }

    /**
     * Переопределяет границы устройств и сразу пересчитывает состояние.
     * @param devices частичный набор границ (`phoneMaxSize`, `tabletMaxSize`, `desktopMaxSize`)
     */
    public setDevices(devices: Partial<IDevices>): void {
        this._devices = { ...this._devices, ...devices };
        this.refresh();
    }

    /**
     * Пересчитывает состояние экрана по текущим `window.*` и `_devices`.
     * Ничего не делает вне браузера или после `destroy()`.
     */
    public refresh(): void {
        if (!this._isBrowser || this._destroy$.isStopped) return;
        this._state$$.next(this._detector.getScreen(this._devices));
    }

    /**
     * Завершает поток состояния и отписывается от слушателей `window`.
     * В обычном приложении вызывать не нужно — сервис root-scoped.
     */
    public destroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
        this._state$$.complete();
    }

    /**
     * Подписывается на `resize`, смену ориентации и плотности пикселей.
     * События объединяются и «схлопываются» через `auditTime`,
     * чтобы не пересчитывать состояние на каждый пиксель ресайза.
     */
    private listenToResize(): void {
        const resize$ = fromEvent(window, 'resize');

        // Смена ориентации (портрет/ландшафт)
        const orientation$ = fromEvent(
            window.matchMedia('(orientation: landscape)'),
            'change',
        );

        // Смена плотности пикселей (например, перетаскивание окна между мониторами)
        const pixelRatio$ = fromEvent(
            window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),
            'change',
        );

        merge(resize$, orientation$, pixelRatio$)
            .pipe(
                auditTime(this._config.resizeDebounceMs),
                takeUntil(this._destroy$),
            )
            .subscribe(() => this.refresh());
    }
}
