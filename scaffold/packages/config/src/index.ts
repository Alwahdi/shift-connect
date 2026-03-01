/**
 * @syndeocare/config — Public API
 */
export { env, getEnv, type Env } from "./env";
export {
  APP_CONFIG,
  PAGINATION,
  UPLOADS,
  SHIFTS,
  OTP,
  AUTH,
  REALTIME,
  QUERY,
  ROLES,
  type AppRole,
} from "./constants";
export {
  PHONE_REGEX,
  PHONE_INTL_REGEX,
  EMAIL_REGEX,
  TAX_ID_REGEX,
  PASSWORD_REGEX,
  UUID_REGEX,
  SLUG_REGEX,
  OTP_REGEX,
  LATITUDE_REGEX,
  LONGITUDE_REGEX,
} from "./patterns";
