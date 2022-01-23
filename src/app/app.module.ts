import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { InfoPopupComponent } from './components/info-popup/info-popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
	declarations: [AppComponent, InfoPopupComponent],
	imports: [BrowserModule, MatDialogModule, MatButtonModule, NoopAnimationsModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
