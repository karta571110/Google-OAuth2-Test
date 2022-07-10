import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig } from 'angular-oauth2-oidc';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';

const oAuthConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  strictDiscoveryDocumentValidation: false,
  redirectUri: window.location.origin,
  clientId: '375486392505-hmn2s9u7od6eljntufgseulme86okkh8.apps.googleusercontent.com',
  scope: 'openid profile email https://www.googleapis.com/auth/gmail.readonly'
}

export interface UserInfo {
  info: {
    sub: string,
    email: string,
    name: string,
    picture: string

  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {

  gmail = 'https://gmail.googleapis.com/'
  userProfileSubject: Subject<UserInfo> = new Subject<UserInfo>();

  constructor(private readonly oAuthService: OAuthService, private httpClient: HttpClient) {
    oAuthService.configure(oAuthConfig);
    oAuthService.logoutUrl = 'https://accounts.google.com/Logout';
    oAuthService.loadDiscoveryDocument().then( () => {
      oAuthService.tryLoginImplicitFlow().then( () => {
        if(!oAuthService.hasValidIdToken()){ //如果沒有Token
          oAuthService.initLoginFlow();//導向至Google登入頁面
        }else{
          oAuthService.loadUserProfile().then ( (userProfile) => {
            console.log(userProfile);
            this.userProfileSubject.next(userProfile as UserInfo);
          });
        }
      });
    });
  }

  emailsList(userId: string): Observable<any> {
    return this.httpClient.get(`${this.gmail}/gmail/v1/users/${userId}/messages`, { headers: this.authHeader() });
  }

  getMail(userId: string, mailId: string): Observable<any> {
    return this.httpClient.get(`${this.gmail}/gmail/v1/users/${userId}/messages/${mailId}`, { headers: this.authHeader() })
  }

  isLoggedIn(): boolean{
    return this.oAuthService.hasValidAccessToken();
  }

  signOut(){
    this.oAuthService.logOut();
  }

  private authHeader(): HttpHeaders{
    return new HttpHeaders ({
      'Authorization': `Bearer ${this.oAuthService.getAccessToken()}`
    });
  }
}
