export default class DateFormat {

    constructor(timeStamp, format) {
        this.dateTimestamp = timeStamp;
        this.format = format;

        this.date = new Date(this.dateTimestamp);

        this._formatDate();
    }

    /**
     *  @returns {string} the string representation of the date in format HH:mm:SS (24h format)
     */
    getFormattedTime() {
        return this.formattedTime;
    }

    /**
     *  @returns {string} the string representation of the date in format dd-MM-yyyy
     */
    getFormattedDate() {
        return this.formattedDate;
    }

    /**
     * @returns {string} the string representation of the date in format dd-MM-yyyy HH:mm:SS.sss (24h format)
     */
    getFullDateString() {
        return this.date.toISOString().replace('T', ' ').replace('Z', '')
    }

    /**
     * @returns {boolean} true if the date is in the last 24 hours, false otherwise
     */
    isInLastDay() {
        const timeStamp = new Date().getTime();
        const timeStampYesterday = timeStamp - (24 * 3600 * 1000);

        return this.dateTimestamp >= timeStampYesterday;
    }

    // ###################### Internal methods ######################

    /**
     * This method is formatting the date to dd-MM-yyyy and HH:mm:SS.sss (24h format)
     * This functionality will be extended with masked formats
     */
    _formatDate() {
        if (!this.dateTimestamp) {
            return;
        }

        let year = this.date.getFullYear();
        let month = this.date.getMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        let day = this.date.getDate();
        if (day < 10) {
            day = `0${day}`;
        }

        this.formattedDate = `${day}-${month}-${year}`;

        let hours = this.date.getHours();
        let minutes = this.date.getMinutes();
        if (minutes < 10) {
            minutes = `0${minutes}`;
        }
        let seconds = this.date.getSeconds();
        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        this.formattedTime = `${hours}:${minutes}:${seconds}`;
    }
}