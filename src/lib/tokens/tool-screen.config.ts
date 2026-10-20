// Импортируем InjectionToken и Provider из ядра Angular.
// InjectionToken нужен для создания уникального ключа внедрения зависимостей,
// а Provider — для описания того, как этот токен должен быть предоставлен в DI-контейнере.
import { InjectionToken, Provider } from '@angular/core';

// Импортируем интерфейс границ устройств и дефолтные значения.
import { DEFAULT_DEVICES, IDevices } from '../models/devices';

/**
 * Интерфейс конфигурации библиотеки ToolScreen.
 * Определяет структуру настроек, которые можно передать при подключении модуля.
 */
export interface IToolScreenConfig {
    /**
     * Границы устройств для классификации экрана.
     * Определяют, при какой ширине/высоте экран считается телефоном, планшетом или десктопом.
     */
    devices: IDevices;

    /**
     * Задержка (в миллисекундах) для подавления частых вызовов при ресайзе (debounce/audit).
     * Помогает избежать лишних пересчетов состояния при изменении размеров окна.
     */
    resizeDebounceMs: number;
}

/**
 * Базовая конфигурация по умолчанию.
 * Используется, если потребитель библиотеки не передал свои значения.
 */
export const DEFAULT_TOOL_SCREEN_CONFIG: IToolScreenConfig = {
    // Берем дефолтные границы устройств (телефон, планшет, десктоп)
    devices: DEFAULT_DEVICES,
    // Задержка 50 мс — оптимальный баланс между отзывчивостью и производительностью
    resizeDebounceMs: 50,
};

/**
 * Уникальный токен для внедрения конфигурации.
 * Позволяет библиотеке запросить настройки через механизм Dependency Injection (DI) Angular.
 * Строка 'TOOL_SCREEN_CONFIG' используется только для отладки (отображается в ошибках DI).
 */
export const TOOL_SCREEN_CONFIG = new InjectionToken<IToolScreenConfig>('TOOL_SCREEN_CONFIG');

/**
 * Фабричная функция для создания провайдера конфигурации.
 * Обычно используется внутри `forRoot()` модуля библиотеки.
 *
 * @param config Частичная конфигурация, переданная пользователем. Может быть пустой.
 * @returns Provider для регистрации конфигурации в DI-контейнере Angular.
 */
export function provideToolScreenConfig(config: Partial<IToolScreenConfig> = {}): Provider {
    return {
        // Указываем, что регистрируем значение именно для токена TOOL_SCREEN_CONFIG
        provide: TOOL_SCREEN_CONFIG,

        // useValue позволяет передать готовый объект (а не класс или фабрику)
        useValue: {
            // 1. Разворачиваем базовую конфигурацию (устанавливаем resizeDebounceMs и devices)
            ...DEFAULT_TOOL_SCREEN_CONFIG,

            // 2. Перезаписываем её тем, что передал пользователь (если передал).
            // Если пользователь передал свой resizeDebounceMs — он заменит дефолтный.
            ...config,

            // 3. Явно обрабатываем вложенный объект devices.
            // Это нужно для глубокого слияния (Deep Merge): если пользователь передал
            // только phoneMaxSize, остальные параметры (tabletMaxSize, desktopMaxSize)
            // должны остаться дефолтными.
            devices: {
                ...DEFAULT_DEVICES,
                ...(config.devices ?? {}) // Если config.devices не передан (undefined), берем пустой объект
            },
        },
    };
}
