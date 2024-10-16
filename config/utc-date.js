const logger = require('./logger');
const moment = require('moment');
const TypeValidator = require('./type-validator');

class UTCDate {
    constructor(date) {
        this.date = date || moment.utc();
    }

    static now() {
        return new UTCDate(moment.utc());
    }

    static fromString(dateString) {
        if (TypeValidator.isDateString(dateString)) {
            return new UTCDate(moment.utc(dateString, "YYYY-MM-DD HH:mm:ss"));
        }
        return null;
    }

    static fromFormat(format, ...values) {

        const formatComponents = ["year", "month", "date", "hour", "minute", "second"];

        const formats = format.split('-');
        if (formats.length !== values.length) {
            throw new Error(`Invalid values length: ${values.length}`);
        }
    
        let defaultMoment = moment.utc().startOf('year');

        for (let i = 0; i < formats.length; i++) {
            const format = formats[i];
            if (!formatComponents.includes(format)) {
                throw new Error(`Invalid format component: ${format}`);
            }
    
            const value = values[i];
            if (!Number.isInteger(value)) {
                throw new Error(`Invalid value format : ${format} to ${value}`);
            }

            else if ( format === "year" && (value < 1850)) {
                throw new Error(`Invalid year : ${value}`);
            }
    
            else if (format === "month" && (value < 1 || value > 12)) {
                throw new Error(`Invalid month: ${value}`);
            }
    
            else if (format === "date" && (value < 1 || value > 31)) {
                throw new Error(`Invalid day: ${value}`);
            }
    
            else if (format === "hour" && (value < 0 || value > 23)) {
                throw new Error(`Invalid hour: ${value}`);
            }
    
            else if (format === "minute" && (value < 0 || value > 59)) {
                throw new Error(`Invalid minute: ${value}`);
            }
    
            else if (format === "second" && (value < 0 || value > 59)) {
                throw new Error(`Invalid second: ${value}`);
            }
    
            defaultMoment.set(format, value);
        }
    
        if (!defaultMoment.isValid()) {
            throw new Error("Invalid date");
        }

        return new UTCDate(defaultMoment);
    }

    // 현재 UTC 시간을 "YYYY-MM-DD HH:mm:ss" 형식으로 반환합니다.
    dateString() {
        return this.date.format("YYYY-MM-DD HH:mm:ss[Z]");
    }

    format(formatType) {
        return this.date.format(formatType);
    }

    addDuration(typeString, value) {
        if (value === undefined || !Number.isInteger(value)) {
            throw new Error(`Invalid value: ${value}`);
        }

        const types = ["years", "months", "days", "hours", "minutes", "seconds"];
        if (!types.includes(typeString)) {
            throw new Error(`Invalid typeString: ${typeString}`);
        }

        let updatedDate = this.date.clone();
        updatedDate.add(value, typeString);

        if (!updatedDate.isValid()) {
            throw new Error(`Invalid date after adding ${value} ${typeString}`);
        }

        return new UTCDate(updatedDate);
    }

    isAfter(utcDate) {
        return this.date.isAfter(utcDate.date);
    }

    isBefore(utcDate) {
        return this.date.isBefore(utcDate.date);
    }

    isAfterNow() {
        return UTCDate.now().isBefore(this);
    }

    isBeforeNow() {
        return UTCDate.now().isAfter(this);
    }

    getYear() {
        return this.date.year();
    }

    getMonth() {
        return this.date.month() + 1;
    }

    getDate() {
        return this.date.date();
    }

    gethours() {
        return this.date.hours();
    }

    getMinutes() {
        return this.date.minutes();
    }

    getSeconds() {
        return this.date.seconds();
    }
}

module.exports = UTCDate;