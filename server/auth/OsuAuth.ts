import { NextFunction, Request, Response } from 'express';
import OsuStrategy, { PassportProfile } from "passport-osu";
import { AuthenticationClient } from "./AuthenticationClient";
import { DateTime } from "luxon";
import { IUser } from "./IUser";
import consola from "consola";
import { injectable } from "tsyringe";
import passport from "passport";

@injectable()
export class OsuAuthentication extends AuthenticationClient {
    protected clientID: string = process.env.OSU2_CLIENT_ID || '';
    protected clientSecret: string = process.env.OSU2_CLIENT_SECRET || '';
    protected callbackURL: string = process.env.OSU2_CALLBACK_URL || '';
    RootURL = "/osu";

    constructor() {
        super();

        if (!this.VarsPresent())
            return;

        consola.info("Setting up osu! authentication routes...")

        passport.use(new OsuStrategy({
            type: 'StrategyOptionsWithRequest',
            clientID: this.clientID,
            clientSecret: this.clientSecret,
            callbackURL: this.callbackURL,
            passReqToCallback: true,
        }, (req: Request, _accessToken: string, _refreshToken: string, profile: PassportProfile, cb: any) => {
            if (!req.user) {
                const o: IUser = {
                    discord: {},
                    osu: {
                        id: `${profile.id}`,
                        displayName: profile.displayName,
                        token: _accessToken,
                        joinDate: DateTime.fromISO(profile._json.join_date),
                        is_restricted: Boolean(profile._json.is_restricted),
                        badges: JSON.stringify(profile._json.badges),
                        osu_global_rank: String(profile._json.statistics_rulesets.osu.global_rank),
                        country_code: profile._json.country_code,
                        json: JSON.stringify(profile._json)
                    }
                }

                return cb(null, o);
            } else {
                const o: IUser = req.user as any;

                o.osu.id = `${profile.id}`;
                o.osu.token = _accessToken;
                o.osu.displayName = profile.displayName;
                o.osu.joinDate = DateTime.fromISO(profile._json.join_date);
                o.osu.is_restricted = Boolean(profile._json.is_restricted);
                o.osu.badges = JSON.stringify(profile._json.badges);
                o.osu.osu_global_rank = profile._json.statistics_rulesets.osu.global_rank;
                o.osu.country_code = profile._json.country_code;
                o.osu.json = JSON.stringify(profile._json);
                return cb(null, o);
            }
        }));

        this.AddRoutes("osu");

        consola.success("osu! authentication routes are registered.")
    }

    // You can insert your own method of checking here if you're familiar with TypeScript.
    // This simple example checks whether a user's account is older than 6 months to prevent new account spam on the tournament hub.
    // Alternatively you can remove everything in the body and just keep: res.redirect('/checks/discord');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected callbackMiddleWare(req: Request, res: Response, next: NextFunction): void {
        const u = req.user as IUser;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const userJoinDate = u.osu.joinDate!;

        // User is allowed to join the discord, so go to verification.
        if(u.osu.is_restricted) {
            u.failureReason = "osu! account is restricted";
            consola.info(`${u.osu.displayName} attempted to register but is restricted.`);
            res.redirect('/checks/manual')
        }
        else {
            res.redirect('/checks/discord');
        }
    }
}
