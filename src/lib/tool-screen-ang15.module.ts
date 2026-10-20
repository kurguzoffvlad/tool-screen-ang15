// ModuleWithProviders — тип, который возвращает статический метод forRoot.
// Он говорит Angular, что модуль предоставляет какие-то глобальные (корневые) провайдеры.
// NgModule — декоратор, превращающий класс в Angular-модуль.
import { ModuleWithProviders, NgModule } from '@angular/core';

// Импортируем интерфейс конфигурации и функцию-фабрику для создания провайдера.
import { IToolScreenConfig, provideToolScreenConfig } from './tokens/tool-screen.config';

/**
 * Корневой модуль библиотеки ToolScreen.
 *
 * В данном случае модуль пустой (в @NgModule() нет imports, declarations или providers).
 * Его единственная задача — предоставить пользователю удобный метод `forRoot()`
 * для регистрации конфигурации (границ устройств и задержки ресайза) на уровне всего приложения.
 */
@NgModule()
export class ToolScreenAng15Module {
    /**
     * Статический метод для настройки модуля при импорте в корневой AppModule.
     *
     * Паттерн `forRoot` используется в Angular для того, чтобы отделить провайдеры,
     * которые должны быть созданы только один раз (синглтоны на всё приложение),
     * от тех, что могут дублироваться (например, в ленивых модулях).
     *
     * @param config Частичная конфигурация (все поля опциональны).
     * Если ничего не передать, будут использованы значения по умолчанию из DEFAULT_TOOL_SCREEN_CONFIG.
     *
     * @returns Объект ModuleWithProviders, содержащий сам модуль и массив провайдеров для DI-контейнера.
     */
    public static forRoot(config: Partial<IToolScreenConfig> = {}): ModuleWithProviders<ToolScreenAng15Module> {
        return {
            // Указываем, какой именно модуль мы настраиваем
            ngModule: ToolScreenAng15Module,

            // Массив провайдеров, которые будут добавлены в корневой инжектор.
            // provideToolScreenConfig(config) возвращает объект { provide: TOOL_SCREEN_CONFIG, useValue: {...} },
            // который регистрирует конфигурацию в DI Angular.
            providers: [provideToolScreenConfig(config)],
        };
    }
}
