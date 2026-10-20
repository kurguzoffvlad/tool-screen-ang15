/**
 * Интерфейс, определяющий максимальные размеры экранов для различных типов устройств.
 * Используется для настройки резиновой и адаптивной верстки.
 */

/** Максимальные размеры экранов для разных типов устройств. */
export interface IDevices {
    phoneMaxSize: number;  // Максимальный размер для смартфонов - iPhone 14 ProMax (430 на 932)
    tabletMaxSize: number; // Максимальный размер для планшетов - iPad Pro (1024 на 1366)
    desktopMaxSize: number; // !!! МАКСИМАЛЬНАЯ ширина для страницы ноутбука - 1500 - Huawei 14 дюймов
}

export const DEFAULT_DEVICES: IDevices = {
    phoneMaxSize: 932,
    tabletMaxSize: 1366,
    desktopMaxSize: 1500,
};
