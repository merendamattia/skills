import { app } from "./api/app.ts";
import { bootstrap } from "./core/bootstrap.ts";
import { config } from "./core/config.ts";
import { logger } from "./core/logger.ts";

await bootstrap();
logger.info("Backend listening", { environment: config.APP_ENV, port: config.PORT });

export default { port: config.PORT, fetch: app.fetch };
