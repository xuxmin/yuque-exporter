import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file"

export const type = {
    Book: "BOOK",
    Title: "TITLE",
    Document: "DOC",
    TitleDoc: "TITLE+DOC",
}

const { format, transports } = winston;

const customFormat = format.combine(
    format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
    format.align(),
    format.printf((i) => `${i.level}: ${[i.timestamp]}: ${i.message}`)
);

const defaultOptions = {
    format: customFormat,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
};

export const logger = winston.createLogger({
  level: "info",
  format: customFormat,
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
        filename: "logs/info-%DATE%.log",
        level: "info",
        ...defaultOptions,
    }),
    new transports.DailyRotateFile({
        filename: "logs/error-%DATE%.log",
        level: "error",
        ...defaultOptions,
    }),
],
});