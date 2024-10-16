class TypeValidator {

    static isString(value) {
        return value !== null && value !== undefined && typeof value === 'string';
    }

    static isNumber(value) {
        return value !== null && value !== undefined && typeof value === 'number';
    }

    static isBoolean(value) {
        return value !== null && value !== undefined && typeof value === 'boolean';
    }

    /*
        YYYY-MM-DD HH:MM:SS
        YYYY-MM-DD HH:MM:SS Z

        위 두 가지 type 이외에는 모두 false를 리턴
    */   
    static isDateString(value) {

        if (value === null || value === undefined || TypeValidator.isString(value) === false ) {
            return false;
        }
        
        const regex = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2}(Z)?)?$/;
        return regex.test(value);
    }

    static isArray(value) {
        return value !== null && value !== undefined && Array.isArray(value);
    }

    static isMovieModel(value) {
        return value !== null && value !== undefined && typeof value === 'MovieModel';
    }

    static isTVModel(value) {
        return value !== null && value !== undefined && typeof value === 'TVModel';
    }
}

module.exports = TypeValidator;