import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThemeClassDirective } from './theme-class.directive';

@NgModule({
	imports: [CommonModule],
	declarations: [ThemeClassDirective],
	exports: [ThemeClassDirective],
})
export class ThemeModule {}
