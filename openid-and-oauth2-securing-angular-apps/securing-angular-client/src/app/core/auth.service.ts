import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { UserManager, User } from 'oidc-client';
import { Constants } from '../constants';

@Injectable()
export class AuthService {
    private _userManager: UserManager;

    constructor(private httpClient: HttpClient) {
        var config = {
            authority: Constants.stsAuthority,
            client_id: 'spa-client',
            redirect_uri: `${Constants.clientRoot}assets/oidc-login-redirect.html`,
            scope: 'openid projects-api profile',
            response_type: 'id_token token',
            post_logout_redirect_uri: `${Constants.clientRoot}`
        }
        this._userManager = new UserManager(config);
     }
    
}