import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from '@home/home-routing.module';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';


// spinner
import { NgxSpinnerModule } from 'ngx-spinner';


import { HomeComponent } from './components/home/home.component';
import { NgChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatButtonModule,
    MatCardModule,
    NgxSpinnerModule,
    NgChartsModule
  ]
})
export class HomeModule { }
