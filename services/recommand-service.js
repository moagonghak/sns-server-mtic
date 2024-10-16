const CommentService = require('./comment-service');

class RecommandService {
    static async GetRecommandComments(fromDate, count) {
        const adminRecommands1 = CommentService.getCommentByUserId(ADMIN_UIDS[0], 0, 5, 0);
    }
}


module.exports = { RecommandService };