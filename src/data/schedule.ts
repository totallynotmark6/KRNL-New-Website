import parser, { ParserOptions } from "cron-parser";

let PARSER_OPTIONS: ParserOptions = {
  tz: "America/Chicago"
}


export class ScheduleItem {
  // end is either a Date, a cron, or a duration in minutes
  constructor(
    public start: Date | string,
    public end: Date | number,
    // optional invalid after date
    public invalidAfter?: Date
  ) {
    this.start = start;
    this.end = end;
    this.invalidAfter = invalidAfter;
  }

    // create a function to check if the current time is within the start and end dates
    // if the start date is a cron, use cron-parser to get the next date
    // if the end date is a cron, use cron-parser to get the next date
    // if the end date is a duration, add the duration to the start date
    // if the current time is between the start and end dates, return true
    // otherwise, return false
    isCurrent() {
        let now = new Date();
        if (this.invalidAfter && now > this.invalidAfter) {
            return false;
        }
        let start = this.start;
        let end = this.end;
        if (typeof start === "string") {
            let startExp = parser.parseExpression(start, PARSER_OPTIONS);
            let prevDate = startExp.prev().toDate();
            let nextDate = startExp.next().toDate();
            if (typeof end === "number") {
                // we gotta work
                let endA = new Date(prevDate.getTime() + end * 60000);
                let endB = new Date(nextDate.getTime() + end * 60000);
                // which one is closer?
                if (Math.abs(endA.getTime() - now.getTime()) < Math.abs(endB.getTime() - now.getTime())) {
                    end = endA;
                    start = prevDate;
                } else {
                    end = endB;
                    start = nextDate;
                }
            }
        }
        return now >= start && now <= end;
    }

    getNextOccurance() {
        let now = new Date();
        if (this.invalidAfter && now > this.invalidAfter) {
            return undefined;
        }
        let start = this.start;
        if (typeof start === "string") {
            let startExp = parser.parseExpression(start, PARSER_OPTIONS);
            return startExp.next().toDate();
        }
        if (now < start) {
            return start;
        }
        return undefined;
    }

    static getParser() {
      return parser
    }

    static getParserOptions() {
      return PARSER_OPTIONS
    }

    static getParserFields() {
      return JSON.parse(JSON.stringify((parser.parseExpression("0 0 0 * * *", PARSER_OPTIONS)).fields))
    }

}
