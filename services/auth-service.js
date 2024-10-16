const { auth } = require("../firebase/firebase-config");
const AuthDataHandler = require("../datahandler/auth-datahandler");
const UTCDate = require('../config/utc-date');

const ADMIN_UIDS = [
    '',
];

const SocialPlatform = {
    Google: 1,
    Apple: 2,
    Kakao: 3,
    Naver: 4,
    Twitter: 5,
    Facebook: 6,
    EMail: 7,
};

class AuthService {

    static platformNames = {
        [SocialPlatform.Google]: "Google",
        [SocialPlatform.Apple]: "Apple",
        [SocialPlatform.Kakao]: "Kakao",
        [SocialPlatform.Naver]: "Naver",
        [SocialPlatform.Twitter]: "Twitter",
        [SocialPlatform.Facebook]: "Facebook",
        [SocialPlatform.EMail]: "EMail",
    };

    static GenerateUserId(platform, userId) {
        const platformName = this.platformNames[platform];
        if (!platformName) {
            throw new Error("Invalid platform");
        }
        return `${platformName}_${userId}`;
    }

    static IsAdminUser(userId) {
        return ADMIN_UIDS.includes(userId);
    }


    static generateRandomString() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /*
        Firebase 유저를 생성하고 CustomToken을 발급
    */
    static async SignUpOrSignInGoogle(platformUserId, nickName, email) {

        try {
            const generated_userId = platformUserId;

            const User = await AuthDataHandler.GetUser(generated_userId);
            const verifiedNickName = User == null ? (nickName == null || nickName.length == 0 ? this.generateRandomString() : nickName) : User.display_name;
            if (User == null) {
                const now = UTCDate.now();
                AuthDataHandler.CreateUser(generated_userId, SocialPlatform.Google, verifiedNickName, email, now.dateString());
            }
            else if (User.deleted == 1) {
                return { customToken: null, verifiedNickName: null, error: "deleted user." };
            }

            return { customToken: null, verifiedNickName: verifiedNickName, error: null };
        } catch (error) {
            console.log(error);
            return { customToken: null, verifiedNickName: null, error: error };
        }
    }

    static async SignUpOrSignInApple(platformUserId, nickName, email) {

        try {
            const generated_userId = platformUserId;

            const User = await AuthDataHandler.GetUser(generated_userId);
            const verifiedNickName = User == null ? (nickName == null || nickName.length == 0 ? this.generateRandomString() : nickName) : User.display_name;
            if (User == null) {
                const now = UTCDate.now();
                AuthDataHandler.CreateUser(generated_userId, SocialPlatform.Apple, verifiedNickName, email, now.dateString());
            }
            else if (User.deleted == 1) {
                return { customToken: null, verifiedNickName: null, error: "deleted user." };
            }

            return { customToken: null, verifiedNickName: verifiedNickName, error: null };
        } catch (error) {
            console.log(error);
            return { customToken: null, verifiedNickName: null, error: error };
        }
    }

    static async SignUpOrSignIn(platform, platformUserId, nickName, email) {

        try {
            if (platform == SocialPlatform.Google) {
                return SignUpOrSignInGoogle(platformUserId, nickName, email);
            }
            else if (platform == SocialPlatform.Apple) {
                return SignUpOrSignInApple(platformUserId, nickName, email);
            }
            else {
                const generated_userId = this.GenerateUserId(platform, platformUserId);

                const User = await AuthDataHandler.GetUser(generated_userId);
                const verifiedNickName = User == null ? (nickName == null || nickName.length == 0 ? this.generateRandomString() : nickName) : User.display_name;
                if (User == null) {
                    const params = {
                        uid: generated_userId,
                        displayName: verifiedNickName,
                        email: email
                    };

                    const userRecord = await auth.createUser(params);
                    if (userRecord) {

                        const now = UTCDate.now();
                        AuthDataHandler.CreateUser(generated_userId, platform, verifiedNickName, email, now.dateString());
                    }
                }
                else if (User.deleted == 1) {
                    return { customToken: null, verifiedNickName: null, error: "deleted user." };
                }

                const customToken = await auth.createCustomToken(generated_userId);
                return { customToken: customToken, verifiedNickName: verifiedNickName, error: null };
            }


        } catch (error) {
            console.log(error);
            return { customToken: null, verifiedNickName: null, error: error };
        }
    }

    /*
        여기서 받는 userId는 GenerateUserId 로 생성된 userId임
    */
    static async SignIn(userId) {
        try {

            const userRecord = await auth.getUser(userId);
            if (userRecord && userRecord.uid == userId) {

                const User = await AuthDataHandler.GetUser(userId);
                if (User == null) {
                    return false;
                }

                if (User.deleted == 1) {
                    return false;
                }

                const last_signin_time = UTCDate.fromString(User.last_signin_time);
                const now = UTCDate.now();

                const isAttendance = last_signin_time.getDate() != now.getDate();
                AuthDataHandler.LoginUser(userId, now.dateString(), isAttendance);

                return true;
            }

            return false;

        } catch (error) {
            console.log(error);
        }
    }

    static async GetUser(userId) {
        return await AuthDataHandler.GetUser(userId);
    }

    static async UpdateDisplayName(userId, displayName) {
        try {
            const bannedDisplayNames = ["Unknown User", "알 수 없는 사용자", "MTIC BOT", "MTIC", "MTIC_BOT", "MTIC-BOT"];

            // If the display name is empty or contains only whitespace characters, return error message
            if (!displayName || displayName.trim() === '') {
                return { value: false, error: 'display name cannot be empty.' };
            }

            // Normalize the input displayName
            const normalizedDisplayName = displayName.replace(/\s+/g, '').toLowerCase();
            // If the display name is in the banned list, return error message
            if (bannedDisplayNames.map(name => name.replace(/\s+/g, '').toLowerCase()).includes(normalizedDisplayName)) {
                return { value: false, error: 'banned display name.' };
            }

            if (await AuthDataHandler.IsDuplicateDisplayName(displayName)) {
                return { value: false, error: 'duplicate display name.' };
            }

            const userRecord = await auth.updateUser(userId, {
                displayName: displayName
            });

            if (userRecord && userRecord.uid == userId) {
                return { value: await AuthDataHandler.UpdateDisplayName(userId, displayName), error: null };
            }
        } catch (error) {
            console.log(error);
            return { value: false, error: error };
        }
    }

    static async DeleteUser(userId) {
        return await AuthDataHandler.DeleteUser(userId);
    }
}

module.exports = { ADMIN_UIDS, SocialPlatform, AuthService };