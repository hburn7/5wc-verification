import { DateTime } from "luxon";

export interface IUser {
    discord: {
        id?: string;
        displayName?: string;
        token?: string;
    }
    osu: {
        id?: string;
        displayName?: string;
        token?: string;
        joinDate?: DateTime;
        is_restricted?: boolean;
        badges?: string;
        osu_global_rank?: string;
        country_code?: string;
        json?: string;
    }
    failureReason?: string;
}
