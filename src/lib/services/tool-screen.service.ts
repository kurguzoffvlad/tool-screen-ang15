import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    BehaviorSubject, Observable, Subject,
    auditTime, distinctUntilChanged, fromEvent, merge, takeUntil,
} from 'rxjs';

import { IDevices } from '../models/devices';
import { IScreenInfo } from '../models/screen.interfaces';
import { TOOL_SCREEN_CONFIG, IToolScreenConfig } from '../tokens/tool-screen.config';
import { ScreenDetectorService } from './screen-detector.service';

function screenInfoEqual(a: IScreenInfo, b: IScreenInfo): boolean {
    return a.screen.type === b.screen.type
        && a.screen.orientation === b.screen.orientation
        && a.screen.options.maxSize === b.screen.options.maxSize
        && a.screen.options.pixelRatio === b.screen.options.pixelRatio
        && a.screen.options.proportions.innerWidth === b.screen.options.proportions.innerWidth
        && a.screen.options.proportions.innerHeight === b.screen.options.proportions.innerHeight
        && a.screen.options.operatingSystem === b.screen.options.operatingSystem
        && a.screen.options.browser === b.screen.options.browser;
}

@Injectable({ providedIn: 'root' })
export class ToolScreenService {
    private readonly _config = inject<IToolScreenConfig>(TOOL_SCREEN_CONFIG);
    private readonly _detector = inject(ScreenDetectorService);
    private readonly _zone = inject(NgZone);
    private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    private readonly _destroy$ = new Subject<void>();
    private readonly _state$$: BehaviorSubject<IScreenInfo>;
    private _devices: IDevices = { ...this._config.devices };

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

    public get state(): IScreenInfo {
        return this._state$$.getValue();
    }

    public setDevices(devices: Partial<IDevices>): void {
        this._devices = { ...this._devices, ...devices };
        this.refresh();
    }

    public refresh(): void {
        if (!this._isBrowser || this._destroy$.isStopped) return;
        this._state$$.next(this._detector.getScreen(this._devices));
    }

    public destroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
        this._state$$.complete();
    }

    private listenToResize(): void {
        this._zone.runOutsideAngular(() => {
            const resize$ = fromEvent(window, 'resize');

            // Слушаем изменение ориентации
            const orientation$ = fromEvent(
                window.matchMedia('(orientation: landscape)'),
                'change'
            );

            // Слушаем изменение плотности пикселей (перетаскивание между мониторами)
            const pixelRatio$ = fromEvent(
                window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),
                'change'
            );

            // Объединяем все события
            merge(resize$, orientation$, pixelRatio$)
                .pipe(
                    auditTime(this._config.resizeDebounceMs),
                    takeUntil(this._destroy$),
                )
                .subscribe(() => {
                    this._zone.run(() => this.refresh()); // <--- Возвращаемся в зону Angular
                });
        });
    }
}
