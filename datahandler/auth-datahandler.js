const mysqlPool = require("../db/mysql-config");

class AuthDataHandler {

    static async CreateUser(userId, platform, displayName, email, signupTime) {
        // INSERT 쿼리 작성
        const sql = `
            INSERT INTO users (user_id, platform, display_name, email, signup_time, last_signin_time)
            VALUES (?, ?, ?, ?, ?, ?);
            `;

        let connection = null;

        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);
            await connection.query(sql, [userId, platform, displayName, email, signupTime, signupTime]);

            return userId;

        } catch (err) {
            console.log(err);
        } finally {
            if (connection) connection.release();
        }
    }

    static async GetUser(userId) {
        // INSERT 쿼리 작성
        const sql = `
                SELECT * FROM users
                WHERE user_id = ?
            `;

        let connection = null;

        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [results] = await connection.query(sql, [userId]);

            if (results.length != 0) {
                return results[0];
            }

            return null;

        } catch (err) {
            console.log(err);
        } finally {
            if (connection) connection.release();
        }
    }

    static async IsDuplicateDisplayName(displayName) {
        // 중복 체크 쿼리 작성
        const sql = `
            SELECT * FROM users WHERE display_name = ?
            `;

        let connection = null;

        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);
            const [results] = await connection.query(sql, [displayName]);

            if (results.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        } finally {
            if (connection) connection.release();
        }
    }

    static async UpdateDisplayName(userId, displayName) {
        // INSERT 쿼리 작성
        const sql = `
            UPDATE users
            SET display_name = ?
            WHERE user_id = ?
            `;

        let connection = null;

        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);
            await connection.query(sql, [displayName, userId]);

            return true;
        } catch (err) {
            console.log(err);
        } finally {
            if (connection) connection.release();
        }
    }

    static async LoginUser(userId, signinTime, isAttendance) {

        // INSERT 쿼리 작성
        const sql = `
            UPDATE users
            SET last_signin_time = ?, attendance_count = attendance_count + ?
            WHERE user_id = ?;
        `;

        let connection = null;

        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);

            // attendance_count를 증가시킬지 결정
            const attendanceIncrement = isAttendance ? 1 : 0;

            // 쿼리 실행
            await connection.query(sql, [signinTime, attendanceIncrement, userId]);
            return true;

        } catch (err) {
            console.log(err);
        } finally {
            if (connection) connection.release();
        }
    }

    static async DeleteUser(userId) {
        // INSERT 쿼리 작성
        const sql = `
            UPDATE users
            SET deleted = 1
            WHERE user_id = ?;
            `;

        let connection = null;

        try {
            // MySQL 커넥션 획득
            connection = await mysqlPool.getConnection(async (conn) => conn);
            await connection.query(sql, [userId]);
            return true;

        } catch (err) {
            console.log(err);
        } finally {
            if (connection) connection.release();
        }
    }
}


module.exports = AuthDataHandler;