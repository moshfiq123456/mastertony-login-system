import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(__dirname, 'logs', 'app.log') }) // Specify the log file path
  ]
});

export default logger;