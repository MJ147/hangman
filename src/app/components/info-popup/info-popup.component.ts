import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InfoDialogData } from 'src/app/models/info-dialog-data';

@Component({
	selector: 'app-info-popup',
	templateUrl: './info-popup.component.html',
	styleUrls: ['./info-popup.component.less'],
})
export class InfoPopupComponent implements OnInit {
	constructor(@Inject(MAT_DIALOG_DATA) public data: InfoDialogData) {}

	ngOnInit(): void {}
}
