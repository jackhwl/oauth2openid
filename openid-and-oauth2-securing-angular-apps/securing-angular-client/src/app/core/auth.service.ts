import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { UserManager, User, WebStorageStateStore, Log } from 'oidc-client';
import { Constants } from '../constants';
import { AuthContext } from '../model/auth-context';
import { Utils } from './utils';

@Injectable()
export class AuthService {
    private _userManager: UserManager;
    private _user: User;
    authContext: AuthContext;

    constructor(private httpClient: HttpClient) {
        Log.logger = console;
        var config = {
            authority: Constants.stsAuthority,
            client_id: Constants.clientId,
            redirect_uri: `${Constants.clientRoot}assets/oidc-login-redirect.html`,
            scope: 'openid projects-api profile',
            response_type: 'id_token token',
            post_logout_redirect_uri: `${Constants.clientRoot}?postLogout=true`,
            userStore: new WebStorageStateStore({ store: window.localStorage }),
            automaticSilentRenew: true,
            silent_redirect_uri: `${Constants.clientRoot}assets/silent-redirect.html`
        };
        // metadata: {
        //     authorization_endpoint: `${Constants.stsAuthority}authorize?audience=projects-api`,
        //     issuer: `${Constants.stsAuthority}`,
        //     jwks_uri: `${Constants.stsAuthority}.well-known/jwks.json`,
        //     end_session_endpoint: `${Constants.stsAuthority}v2/logout?returnTo=${Constants.clientRoot}?postLogout=true`
        // }

        this._userManager = new UserManager(config);
        this._userManager.getUser().then(user => {
            if (user && !user.expired){
                this._user = user;
                this.loadSecurityContext();
            }
        });
        this._userManager.events.addUserLoaded(()=>{
            this._userManager.getUser().then(user => {
                console.log('new user loaded=======');
                this._user = user;
                this.loadSecurityContext();
            });
        });
     }

     login(): Promise<any> {
         return this._userManager.signinRedirect();
     }
    
     logout(): Promise<any> {
        return this._userManager.signoutRedirect();
    }
   
    isLoggenIn(): boolean {
        return this._user && this._user.access_token && !this._user.expired;
    }

    getAccessToken(): string {
        return this._user ? this._user.access_token : '';
    }

    signoutRedirectCallback(): Promise<any> {
        return this._userManager.signoutRedirectCallback();
    }

    loadSecurityContext() {
        this.httpClient.get<AuthContext>(`${Constants.apiRoot}Account/AuthContext`).subscribe(context => {
            this.authContext = context;
            console.log('context=', context);
        }, error => console.error(Utils.formatError(error)));
    }
}