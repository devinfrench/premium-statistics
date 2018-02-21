const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const MONTH_NAMES_ABBREV = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

class Calender {

    constructor() {
        this.today = new Date();
        this.today = new Date(this.today.valueOf() + this.today.getTimezoneOffset() * 60000);
        this.month = this.today.getMonth();
        this.year = this.today.getFullYear();
    }

    getDay() {
        return this.today.getDate();
    }

    getMonth(months) {
        if (months) {
            let date = new Date(this.year, this.month - months, 1);
            return date.getMonth();
        }
        return this.month;
    }

    getYear(months) {
        if (months) {
            let date = new Date(this.year, this.month - months, 1);
            return date.getFullYear();
        }
        return this.year;
    }

    getDaysInMonth(month, year) {
        let date = new Date(year, month + 1, 0);
        return date.getDate();
    }

    getPreviousTwelveMonths() {
        let months = {
            month: new Array(12),
            year: new Array(12),
            monthNames: new Array(12),
            monthNamesAbbrev: new Array(12)
        }
        for (let i = 0; i < 12; i++) {
            months.month[11 - i] = this.getMonth(i + 1);
            months.year[11 - i] = this.getYear(i + 1);
            months.monthNames[11 - i] = Calender.getMonthName(months.month[11 - i]);
            months.monthNamesAbbrev[11 - i] = Calender.getMonthNameAbbrev(months.month[11 - i]);
        }
        return months;
    }

    static getMonthName(month) {
        return MONTH_NAMES[month];
    }

    static getMonthNameAbbrev(month) {
        return MONTH_NAMES_ABBREV[month];
    }

    static get MONTH_NAMES() {
        return MONTH_NAMES_ABBREV;
    }

    static get MONTH_NAMES_ABBREV() {
        return MONTH_NAMES_ABBREV;
    }

}