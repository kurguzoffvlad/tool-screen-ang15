// lib/demo/tool-screen-demo.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolScreenService } from '../services/tool-screen.service';

@Component({
    selector: 'lib-tool-screen-demo',
    standalone: true,
    imports: [CommonModule],
    template: `
        <h3>tool-screen demo</h3>
        <p>type: {{ (screen.state$ | async)?.screen?.type }}</p>
        <p>orientation: {{ (screen.state$ | async)?.screen?.orientation }}</p>
        <p>innerWidth: {{ (screen.state$ | async)?.screen?.options?.proportions?.innerWidth }}</p>
        <pre>{{ (screen.state$ | async) | json }}</pre>

        <button (click)="shrink()">phoneMaxSize = 800</button>
        <button (click)="refresh()">refresh()</button>
    `,
})
export class ToolScreenDemoComponent {
    public readonly screen = inject(ToolScreenService);

    public shrink(): void {
        this.screen.setDevices({ phoneMaxSize: 800 });
    }

    public refresh(): void {
        this.screen.refresh();
    }
    // destroy() НЕ вызываем — сервис root-scoped
}
