import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TextComponent} from "./bot/text.component";

const routes: Routes = [
  { path: '', component: TextComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
