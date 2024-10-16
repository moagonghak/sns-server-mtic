const logger = require('../config/logger');
const UTCDate = require('../config/utc-date');

const TicketDataHandler = require("../datahandler/ticket-datahandler");
const { uploadImageToFirebase, deleteImageFromFirebase, getTicketDownloadUrl } = require("../firebase/firebase-storage");


class TicketService {

  /*
      function : registerTicket
      description: ticket을 db및 firegase cloud storage에 추가

      @param
          media_type : Number
          media_id : Number
          user_id : String
          image : File
          watched_time : String (date)

      @return List<Object>
          0 : ticket_id : String,
          1 : ticket_path : String,
          2 : update_time : Date
  */
  static async registerTicket(media_type, media_id, user_id, image, watched_time) {

    try {

      if (image == undefined || image == null) {
        logger.warn(`[service] registerTicket, user_id: ${user_id} invalid image`);
        return null;
      }

      const ticketUploadResult = await uploadImageToFirebase(user_id, image);
      if (ticketUploadResult !== null) {

        const [ticket_id, ticket_path] = ticketUploadResult;
        const update_time = await new UTCDate().dateString();

        const bRegistered = await TicketDataHandler.registerTicket(ticket_id, media_type, media_id, user_id, ticket_path, watched_time, update_time);
        if (bRegistered === true) {
          return [ticket_id, ticket_path, update_time];
        }
      } else {
        logger.warn(`[service] registerTicket, user_id: ${user_id} upload tickeg image to firestore failed`);
      }

    } catch (err) {
      logger.error(err);
    }

    return null;
  }

  /*
      function : unregisterTicket
      description: ticket을 db및 firegase cloud storage에서 제거

      @param
        user_id : String
        ticket_id : String
        

      @return
          result : Boolean
  */
  static async unregisterTicket(user_id, ticket_id) {
    try {

      const ticket_path = await TicketService.getTicketPath(user_id, ticket_id);
      if (ticket_path !== '') {

        const bFirebaseDeleted = await deleteImageFromFirebase(ticket_path);

        if (bFirebaseDeleted) {
          const bDeleted = await TicketDataHandler.unregisterTicket(user_id, ticket_id);
          if (bDeleted) {
            return true;
          } else {
            logger.error(`[service] unregisterTicket, failed to delte ticket in mysql db, but deleted from firebase storage, user_id: ${user_id}, ticket_id: ${ticket_id}, ticket_path: ${ticket_path}`);
          }
        } else {
          logger.warn(`[service] unregisterTicket, failed to delte ticket in firebase storage, user_id: ${user_id}, ticket_id: ${ticket_id}, ticket_path: ${ticket_path}`);
        }
      }
    } catch (err) {
      logger.error(err);
    }

    return null;
  }

  /*
      function : getAllTickets
      description: ticket path 정보를 mysql db에서 얻어옴

      @param
          user_id : String
          order : Number      // 0 : 관람순, 1 : 등록순

      @return
          result : List<JsonObject>
              ticket_id: String,
              media_type: Number,
              media_id: Number,
              ticket_image_path: String,
              watched_time: String (date),
              update_time: String (date)
  */
  static async getAllTickets(user_id, order) {
    try {

      const tickets = await TicketDataHandler.getAllTickets(user_id, order);
      return tickets;

    } catch (err) {
      logger.error(err);
    }

    return null;
  }

  /*
      function : getTicketPath
      description: ticket path 정보를 mysql db에서 얻어옴

      @param
          ticket_id : String
          user_id : String
          

      @return
          result : String
  */
  static async getTicketPath(user_id, ticket_id) {
    try {

      const ticket_path = await TicketDataHandler.getTicketPath(user_id, ticket_id);
      if (ticket_path !== null) {
        return ticket_path;
      }
    } catch (err) {
      logger.error(err);
    }

    return null;
  }

  /*
      function : getTicketUrl
      description: firebase storage의 ticket을 expireSec 동안 download 받을 수 있는 shorten url을 얻어옴

      @param
        user_id : String
          ticket_id : String
          expireSec : Number
          

      @return
          result : String
  */
  static async getTicketUrl(user_id, ticket_id, expireSec) {

    try {

      const ticketPath = await TicketService.getTicketPath(user_id, ticket_id);
      if (ticketPath !== null) {
        const downloadUrl = await getTicketDownloadUrl(ticketPath, expireSec);
        if (downloadUrl != null || downloadUrl !== '') {
          return downloadUrl;
        }

      } else {
        logger.verbose(`[service] getTicketUrl, failed to get url, user_id: ${user_id}, ticket_id: ${ticket_id}, expireSec: ${expireSec}`);
      }

    } catch (err) {
      logger.error(`[service] getTicketUrl, user_id: ${user_id}, ticket_id: ${ticket_id}, expireSec: ${expireSec}`);
      logger.error(err);
    }

    return null;
  }


}

module.exports = TicketService;
