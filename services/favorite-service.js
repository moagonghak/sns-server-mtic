const FavoriteDataHandler = require("../datahandler/favorite-datahandler");
const UTCDate = require('../config/utc-date');

class FavoriteService {

    /*
        function : registerFavorite
        description: 관심 추가

        @param
            user_id : String
            media_type : Number
            media_id : Number

        @return
            update_time : String
    */
    static async registerFavorite(user_id, media_type, media_id) {

        try {

            const update_time = await new UTCDate().dateString();
            const bRegistered = await FavoriteDataHandler.registerFavorite(user_id, media_type, media_id, update_time);

            if (bRegistered === true) {
                return update_time;
            }
        } catch (err) {
            logger.error(`[service] registerFavorite, ${err}`);
        }

        return null;
    }

    /*
        function : unregisterFavorite
        description: 관심 제거

        @param
            user_id : String
            media_type : Number
            media_id : Number

        @return
            result : Boolean
    */
    static async unregisterFavorite(user_id, media_type, media_id) {

        try {

            const bUnregistered = await FavoriteDataHandler.unregisterFavorite(user_id, media_type, media_id);

            if (bUnregistered === true) {
                return true;
            }

        } catch (err) {
            logger.error(`[service] unregisterFavorite, ${err}`);
        }

        return false;
    }


    /*
        function : getUesrFavorites
        description: 관심 리스트 추출

        @param
            user_id : String

        @return
            result : List<JsonObject>
            {
                media_type : Number,
                media_id : Number,
                update_time : String (date)
            }
    */
    static async getUesrFavorites(user_id) {

        try {

            const favorites = await FavoriteDataHandler.getUesrFavorites(user_id);

            if (favorites !== null) {
                return favorites;
            }

        } catch (err) {
            logger.error(`[service] getUesrFavorites, ${err}`);
        }

        return null;
    }
}

module.exports = FavoriteService;
