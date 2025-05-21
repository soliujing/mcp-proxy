import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logLevel = (process.env.DEBUG_LEVEL || 'info').toLowerCase();

const baseLogger = createLogger({
    level: logLevel,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf((info) => {
            const location = info.file && info.line ? `${info.file}:${info.line}` : 'unknown';
            return `${info.timestamp} | ${info.level.toUpperCase()} | ${location} | ${info.message}`;
        })
    ),
    transports: [
        new transports.File({
            filename: 'app.log',
            maxsize: 5_000_000,
            maxFiles: 3,
        }),
        new transports.Console(),
    ],
});

// Add wrapper to capture file & line
function attachFileLine(level: keyof typeof baseLogger) {
    const original = baseLogger[level].bind(baseLogger);
    return (...args: any[]) => {
        const stack = new Error().stack?.split('\n') || [];
        const callSite = stack.find((line) => !line.includes('logger.ts') && line.includes('at '));
        const match = callSite?.match(/\((.*):(\d+):\d+\)/) || callSite?.match(/at (.*):(\d+):\d+/);
        const [filePath, lineNumber] = match?.slice(1, 3) || [];
        
        // Inject metadata
        const meta = {
            file: path.basename(filePath || ''),
            line: lineNumber,
        };
        
        if (typeof args[0] === 'string') {
            original({ level, message: args[0], ...meta });
        } else {
            original({ level, ...args[0], ...meta });
        }
    };
}

// Create final logger with wrapped methods
const logger = {
    ...baseLogger,
    log: attachFileLine('info'),
    info: attachFileLine('info'),
    error: attachFileLine('error'),
    warn: attachFileLine('warn'),
    warning: attachFileLine('warn'),
    debug: attachFileLine('debug'),
};

export { logger };