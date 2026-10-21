Понял! Вот README для библиотеки **`tool-screen-ang15`**, оформленный в том же стиле, что и ваш файл про DOM: с заголовками, оглавлением, таблицами, блоками кода и разбивкой по разделам.

***

```markdown
# ToolScreen (`tool-screen-ang15`)

Библиотека для Angular 15, которая определяет тип устройства (смартфон, планшет, десктоп), ориентацию экрана, операционную систему, браузер и плотность пикселей. Предоставляет реактивный поток состояния экрана через RxJS и поддерживает SSR.

- **`ScreenDetectorService`** — сбор информации об экране и устройстве;
- **`ToolScreenService`** — реактивное состояние, автоматическое обновление, конфигурация;
- **`detectBrowser` / `detectOperatingSystem`** — утилиты определения браузера и ОС по User-Agent.

---

## Содержание

- [Установка и запуск](#установка-и-запуск)
- [Структура](#структура)
- [Конфигурация](#конфигурация)
- [Сервисы](#сервисы)
    - [ScreenDetectorService](#screendetectorservice)
    - [ToolScreenService](#toolscreenservice)
- [Интерфейсы и типы](#интерфейсы-и-типы)
- [Перечисления](#перечисления)
- [Утилиты](#утилиты)
- [Примеры использования](#примеры-использования)
- [SSR](#ssr)
- [Логирование](#логирование)

---

## Установка и запуск

Установите библиотеку:

```bash
npm install tool-screen-ang15
```

Требуемые peer-зависимости (обычно уже есть в проекте):

```bash
npm install @angular/common@^15.2.0 @angular/core@^15.2.0
```

Импортируйте модуль в `AppModule`:

```ts
import {provideToolScreenConfig} from 'tool-screen-ang15';

@NgModule({
    providers: [ provideToolScreenConfig()],
})
export class AppModule {}
```

---

## Структура

```
tool-screen-ang15/
├── models/
│   ├── devices.ts              # интерфейс и дефолтные границы устройств
│   ├── screen.enums.ts         # перечисления (ОС, браузер, тип экрана, ориентация)
│   └── screen.interfaces.ts    # интерфейсы состояния экрана
├── services/
│   ├── screen-detector.service.ts  # сбор данных из window
│   └── tool-screen.service.ts      # реактивный стейт + автоподписка
├── tokens/
│   └── tool-screen.config.ts   # InjectionToken + фабрика конфигурации
├── utils/
│   ├── browser.util.ts         # detectBrowser
│   └── os.util.ts              # detectOperatingSystem
└── public-api.ts               # точка входа библиотеки
```

---

## Конфигурация

Интерфейс `IToolScreenConfig`:

```ts
interface IToolScreenConfig {
  devices: IDevices;        // границы устройств
  resizeDebounceMs: number; // задержка auditTime при ресайзе (мс)
}
```

Интерфейс `IDevices`:

```ts
interface IDevices {
  phoneMaxSize: number;   // макс. размер для смартфонов (по умолчанию 932)
  tabletMaxSize: number;  // макс. размер для планшетов (по умолчанию 1366)
  desktopMaxSize: number; // макс. ширина для ноутбука (по умолчанию 1500)
}
```

**Значения по умолчанию** (`DEFAULT_TOOL_SCREEN_CONFIG`):

| Параметр | Значение |
|---|---|
| `phoneMaxSize` | `932` |
| `tabletMaxSize` | `1366` |
| `desktopMaxSize` | `1500` |
| `resizeDebounceMs` | `50` |

> **Важно:** `forRoot()` выполняет глубокое слияние для `devices`. Если передать только `phoneMaxSize`, остальные границы останутся дефолтными.

---

## Сервисы

### ScreenDetectorService

Отвечает за сбор информации об экране и устройстве из `window.*` и `navigator.userAgent`.

| Метод | Что делает |
|---|---|
| `getScreen(devices)` | Возвращает заполненный `IScreenInfo`: пропорции, тип устройства, ориентация, ОС, браузер, pixelRatio, maxSize. |
| `getEmptyScreen(devices)` | Возвращает «пустой» `IScreenInfo` (все поля `null` / `Unknown`) для SSR. |
| `getType(maxSize, devices)` | Приватный. Определяет тип экрана по `max(innerWidth, innerHeight)`. |
| `getOrientation()` | Приватный. Определяет ориентацию через `matchMedia('(orientation: landscape)')`. |

---

### ToolScreenService

Root-scoped сервис (`providedIn: 'root'`). Один экземпляр на всё приложение.

| Член | Тип | Описание |
|---|---|---|
| `state$` | `Observable<IScreenInfo>` | Публичный поток состояния экрана (read-only) |
| `state` | `IScreenInfo` | Синхронный снимок текущего состояния |
| `setDevices(devices: Partial<IDevices>)` | `void` | Переопределяет границы устройств и сразу пересчитывает состояние |
| `refresh()` | `void` | Принудительно пересчитывает состояние (no-op в SSR и после `destroy()`) |
| `destroy()` | `void` | Завершает поток и отписывается от слушателей `window` (для тестов/SSR) |

Сервис автоматически подписывается на:
- `window.resize`;
- изменение `orientation` (landscape/portrait);
- изменение `devicePixelRatio` (`resolution: Xdppx`).

События «схлопываются» через `auditTime(resizeDebounceMs)`.

---

## Интерфейсы и типы

```ts
type TNullable<T> = T | null;
type TScreen = ScreenEnums.Desktop | ScreenEnums.Tablet | ScreenEnums.Phone;
type TOrientation = OrientationScreenEnum.Horizontal | OrientationScreenEnum.Vertical;

interface IScreenProportions {
  width: TNullable<number>;       // window.screen.width
  height: TNullable<number>;      // window.screen.height
  innerWidth: TNullable<number>;  // window.innerWidth
  innerHeight: TNullable<number>; // window.innerHeight
}

interface IScreenOptions {
  operatingSystem: OperatingSystemEnum;
  browser: BrowserEnum;
  pixelRatio: TNullable<number>;
  proportions: IScreenProportions;
  maxSize: TNullable<number>; // max(innerWidth, innerHeight)
}

interface IScreenInfo {
  devices: IDevices;
  screen: {
    type: TNullable<TScreen>;
    orientation: TNullable<TOrientation>;
    options: IScreenOptions;
  };
}
```

---

## Перечисления

**`ScreenEnums`**

| Значение | Описание |
|---|---|
| `Desktop = 'desktop'` | Десктоп |
| `Tablet = 'tablet'` | Планшет |
| `Phone = 'phone'` | Смартфон |

**`OrientationScreenEnum`**

| Значение | Описание |
|---|---|
| `Horizontal = 'horizontal'` | Ландшафтная |
| `Vertical = 'vertical'` | Портретная |

**`OperatingSystemEnum`**

`Windows`, `MacOS`, `Linux`, `Android`, `iOS`, `UNIX`, `Unknown`

**`BrowserEnum`**

`Edge`, `Chrome`, `Firefox`, `Safari`, `Opera`, `InternetExplorer`, `Unknown`

---

## Утилиты

```ts
import { detectBrowser, detectOperatingSystem } from 'tool-screen-ang15';

detectBrowser();                       // по navigator.userAgent
detectBrowser('custom user-agent');    // по переданной строке
detectOperatingSystem();
detectOperatingSystem('custom ua');
```

> ⚠️ Утилиты `detectBrowser` / `detectOperatingSystem` используют `navigator.userAgent` по умолчанию. В SSR передавайте UA-строку явно или не вызывайте их вне браузера (сервис делает это автоматически).

---

## Примеры использования

**Адаптивная вёрстка по типу устройства:**

```ts
@Component({
  selector: 'app-layout',
  template: `
        <div class="screen-box"
         [class]="'screen-box type-' + (state.screen.type ?? 'unknown')
                 + ' orientation-' + (state.screen.orientation ?? 'unknown')">
        <h3>tool-screen</h3>

        <p>type: {{ state.screen.type }}</p>
        <p>orientation: {{ state.screen.orientation }}</p>
        <p>innerWidth: {{ state.screen.options.proportions.innerWidth }}</p>

        <pre>{{ state | json }}</pre>
    </div>
  `,
})
export class LayoutComponent {
    public readonly screen = inject(ToolScreenService);
}
```

**Условная логика через `state$`:**

```ts
this.toolScreen.state$.subscribe((info) => {
  if (info.screen.type === ScreenEnums.Phone) {
    // мобильная логика
  }
});
```

**Ручное обновление после изменения конфигурации:**

```ts
this.toolScreen.setDevices({ phoneMaxSize: 900 });
// состояние пересчитано синхронно
```

**Использование standalone-компонентов (без модуля):**

```ts
import { ApplicationConfig } from '@angular/core';
import { provideToolScreenConfig } from 'tool-screen-ang15';

export const appConfig: ApplicationConfig = {
  providers: [
    provideToolScreenConfig({
      devices: { phoneMaxSize: 900 },
      resizeDebounceMs: 100,
    }),
  ],
};
```

> Если `TOOL_SCREEN_CONFIG` не зарегистрирован, `ToolScreenService` упадёт при инжекте. Всегда регистрируйте конфигурацию (через `forRoot()` или `provideToolScreenConfig()`).

---

## SSR

Сервис определяет платформу через `isPlatformBrowser(PLATFORM_ID)`:

- **В браузере** — `getScreen()` читает `window.*` и подписывается на события.
- **Вне браузера (SSR/WebWorker)** — возвращается `getEmptyScreen()`: все поля `null` / `Unknown`, подписки на `window` не создаются.

Это позволяет безопасно использовать `ToolScreenService` в Universal-приложениях без ошибок `window is not defined`.

---

## Логирование

Сервис **не ведёт собственный журнал** — всё состояние доступно через `state$` и `state`. Если вам нужен лог изменений, подпишитесь на `state$` самостоятельно:

```ts
this.toolScreen.state$.subscribe((info) => {
  console.log('[Screen]', info.screen.type, info.screen.orientation);
});
```

---

## Примечания

- `ScreenDetectorService` обращается к `window` только внутри `getScreen()`; при SSR используется `getEmptyScreen()`.
- `forRoot()` выполняет глубокое слияние `devices` — можно передать только часть полей.
- `resizeDebounceMs` управляет `auditTime` — чем больше значение, тем реже пересчёт.
- Все публичные типы и сервисы экспортируются через `public-api.ts`.
```
