import { GoogleApiService, UserInfo } from './services/google-api.service';
import { Component } from '@angular/core';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  userInfo?: UserInfo;
  mailSnippets: string[] = [];
  constructor(private readonly google: GoogleApiService){
    google.userProfileSubject.subscribe( info =>{
      console.log('dddd')
      this.userInfo = info;
    });
  }

  async getEmails(){
    if (!this.userInfo) {
      return;
    }

    const userId = this.userInfo?.info.sub as string
    const messages = await lastValueFrom(this.google.emailsList(userId));
    console.log(messages);
    messages.messages.forEach( (element: { id: string, threadId: string}) => {
      const mail = lastValueFrom(this.google.getMail(userId, element.id))
      mail.then( mail => {
        console.log(mail);
        this.mailSnippets.push(mail.snippet)
      });
    });
  }

  isLoggedIn(): boolean{
    return this.google.isLoggedIn();
  }

  logout(){
    this.google.signOut();
  }

}
