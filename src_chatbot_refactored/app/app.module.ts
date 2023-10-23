import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StatusbarComponent } from '../statusbar/statusbar.component';
import { ScrollButtonComponent } from '../scroll-button/scroll-button.component';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';

@NgModule({
  declarations: [
    AppComponent,
    StatusbarComponent,
    ScrollButtonComponent,
    DialogBoxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    NgbModalModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
