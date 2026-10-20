import { ModuleWithProviders, NgModule } from '@angular/core';
import { IToolScreenConfig, provideToolScreenConfig } from './tokens/tool-screen.config';


@NgModule()
export class ToolScreenAng15Module {
    public static forRoot(config: Partial<IToolScreenConfig> = {}): ModuleWithProviders<ToolScreenAng15Module> {
        return {
            ngModule: ToolScreenAng15Module,
            providers: [provideToolScreenConfig(config)],
        };
    }
}
