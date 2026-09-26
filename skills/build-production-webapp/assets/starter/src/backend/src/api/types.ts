import type { Session } from "../core/auth.ts";

export type AppEnv = {
  Variables: {
    user: Session["user"];
    session: Session["session"];
    requestId: string;
  };
};
